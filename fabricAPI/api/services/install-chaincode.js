'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var config = require('../../config.js');
var helper = require('../helpers/helper.js');
var users = require('./users.js');
var Log = require( 'log' ),
  log = new Log( config.logLevel ); // debug, info, error
//Attempt to send a request to the orderer with the sendCreateChain method
var nameModule = '[Install-chaincode]'

var installChaincode = function(peers, chaincodeName, chaincodePath,
	chaincodeVersion, username, orgName) {
	var nameMethod = '[installChaincode]'
  log.info(`${nameModule} ${nameMethod} Installing chaincode -> ${chaincodeName}`);
	process.env.GOPATH = path.join(__dirname, config.CC_SRC_PATH);
  var network = helper.initNetworkStructure(orgName, 'none');
  var client = network.client;

	return new Promise((resolve, reject) => {
    users.getOrgAdmin(orgName, client)
		.then(admin => {
			log.debug(`${nameModule} ${nameMethod} Successfully obtenied admin user for -> ${orgName}`);
			// sign the channel config bytes as "endorsement", this is required by
			// the orderer's channel creation policy
			var request = {
				targets: helper.prepareTargetsPeers(peers, orgName, client),
				chaincodePath: chaincodePath,
				chaincodeId: chaincodeName,
				chaincodeVersion: chaincodeVersion
			};
			client.installChaincode(request)
			.then(results =>{
				var proposalResponses = results[0];
				var proposal = results[1];
				var all_good = true;
				for (var i in proposalResponses) {
					var one_good = false;
					if (proposalResponses && proposalResponses[i].response &&
						proposalResponses[i].response.status === 200) {
						one_good = true;
						log.info(`${nameModule} ${nameMethod} The proposal install was good`);
						log.debug(proposalResponses[i]);
					} else {
						log.info(`${nameModule} ${nameMethod} The proposal install was bad`);
						log.debug(proposalResponses[i]);
					}
					all_good = all_good & one_good;
				}
				if (all_good) {
          log.info(`${nameModule} ${nameMethod} Successfully install chaincode`);
					resolve()
				} else {
          log.info(`${nameModule} ${nameMethod} Error with the proposal to install chaincode`);
	        var msg = 'Some proposal to install the chaincode was bad, the chaincode -> '
					+ chaincodeName + ' ' + chaincodeVersion + ' could exists already.';
					reject(msg);
				}
			})
			.catch(err =>{
				log.error(`${nameModule} ${nameMethod} Error installing the chaincode -> ${chaincodeName}`);
				log.error(err);
				reject(err);
			})
		})
		.catch(err =>{
			log.error(`${nameModule} ${nameMethod} Error getting admin user for -> ${orgName}`);
			log.error(err);
			reject(err);
		})
	})
};

exports.installChaincode = installChaincode;
