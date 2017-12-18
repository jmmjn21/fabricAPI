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
var nameModule = '[Instantiate-chaincode]'

var instantiateChaincode = function(peers ,channelName, chaincodeName, chaincodeVersion, functionName, args, username, orgName) {
	var nameMethod = '[instantiateChaincode]'
  log.info(`${nameModule} ${nameMethod} Instantiating chaincode -> ${chaincodeName}`);
  var network = helper.initNetworkStructure(orgName, channelName);
  var client = network.client;
  var channel = network.channel;
  helper.setupPeers(channel, peers, client);

	return new Promise((resolve, reject) => {
    users.getOrgAdmin(orgName, client)
		.then(admin => {
			channel.initialize()
			.then(success =>{
				log.debug(`${nameModule} ${nameMethod} Successfully obtanied admin user for -> ${orgName}`);
				// sign the channel config bytes as "endorsement", this is required by
				// the orderer's channel creation policy
				var tx_id = client.newTransactionID();

				var request = {
					chaincodeId: chaincodeName,
					chaincodeVersion: chaincodeVersion,
					args: args,
					txId: tx_id
				};
				if (functionName) {
					request.fcn = functionName;
				}
				channel.sendInstantiateProposal(request)
				.then(results =>{
					var proposalResponses = results[0];
					var proposal = results[1];
					var all_good = true;
					for (var i in proposalResponses) {
						var one_good = false;
						if (proposalResponses && proposalResponses[i].response &&
							proposalResponses[i].response.status === 200) {
							one_good = true;
							log.info(`${nameModule} ${nameMethod} The proposal instantiate was good`);
							log.debug(proposalResponses[i]);
						} else {
							log.info(`${nameModule} ${nameMethod} The proposal instantiate was bad`);
							log.debug(proposalResponses[i]);
						}
						all_good = all_good & one_good;
					}
					if (all_good) {
	          log.info(`${nameModule} ${nameMethod} All good proposal to instantiate chaincode`);

						var request = {
							proposalResponses: proposalResponses,
							proposal: proposal
						};

            channel.sendTransaction(request)
						.then(instantiated => {
							log.info(`${nameModule} ${nameMethod} Successfully instantiate chaincode`);
							resolve(instantiated)
						})
						.catch(err =>{
              log.error(`${nameModule} ${nameMethod} Error isnantiating chaincode`);
							var msg = 'Some proposal to instantiate the chaincode was bad';
							reject(msg)
						})
					} else {
	          log.info(`${nameModule} ${nameMethod} Error with the proposal to instantiate chaincode`);
		        var msg = 'Some proposal to instantiate the chaincode was bad';
						reject(msg);
					}
				})
				.catch(err =>{
					log.error(`${nameModule} ${nameMethod} Error instantiating the chaincode -> ${chaincodeName}`);
					log.error(err);
					reject(err);
				})
			})
		})
		.catch(err =>{
			log.error(`${nameModule} ${nameMethod} Error getting admin user for -> ${orgName}`);
			log.error(err);
			reject(err);
		})
	})
};

exports.instantiateChaincode = instantiateChaincode;
