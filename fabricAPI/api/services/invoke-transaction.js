'use strict';
var util = require('util');
var helper = require('../helpers/helper.js');
var users = require('./users.js');
var config = require('../../config.js');
var Log = require( 'log' ),
  log = new Log( config.logLevel ); // debug, info, error
var ORGS = config.orgs;

var nameModule = '[Invoke-chaincode]'

var invokeChaincode = function (peerNames, channelName, chaincodeName, fcn, args, username, orgName) {
	var nameMethod = '[invokeChaincode]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Invoking function >>> -> ${fcn} with args -> ${JSON.stringify(args)}`);
  var network = helper.initNetworkStructure(orgName, channelName);
  var client = network.client;
  var channel = network.channel;

	var targets = helper.prepareTargetsPeers(peerNames, orgName, client);
	var tx_id = null;
	var transactionResponse = null;

	return new Promise((resolve, reject) => {
		users.getOrgAdmin(orgName, client)
		.then(user =>{
			tx_id = client.newTransactionID();
			log.debug(`${nameModule} ${nameMethod} <<< Sending transaction >>> -> ${JSON.stringify(tx_id)}`);
			var request = {
				chaincodeId: chaincodeName,
				fcn: fcn,
				args: args,
				chainId: channelName,
				txId: tx_id
			};
			if (targets) {
			  request.targets = targets;
			}
			channel.sendTransactionProposal(request)
			.then(results =>{
				var proposalResponses = results[0];
				var proposal = results[1];
				var all_good = true;

				for (var i in proposalResponses) {
					let one_good = false;
					if (proposalResponses && proposalResponses[i].response &&
						proposalResponses[i].response.status === 200) {
						one_good = true;
						log.info(`${nameModule} ${nameMethod} <<< The proposal invoke was good >>>`);
						log.debug(proposalResponses[i]);
					} else {
						log.info(`${nameModule} ${nameMethod} <<< The proposal invoke was bad >>>`);
						log.debug(proposalResponses[i]);
					}
					all_good = all_good & one_good;
				}

				if (all_good) {
					log.info(`${nameModule} ${nameMethod} <<< All good proposal to invoke function >>>`);

					var request = {
						proposalResponses: proposalResponses,
						proposal: proposal
					};

					var transactionID = tx_id.getTransactionID();
					///****
					channel.sendTransaction(request)
					.then(invoked => {
            var transactionResponse = util.format("%s", proposalResponses[0].response.payload);
						log.info(`${nameModule} ${nameMethod} (OUT) <<< Successfully invoke function >>> with result -> ${JSON.stringify(transactionResponse)}`);
						resolve(transactionResponse);
					})
					.catch(err =>{
						log.error(`${nameModule} ${nameMethod} (OUT) <<< Error invoking function >>>`);
						var msg = err.toString();
						reject(msg);
					})
				} else {
					log.info(`${nameModule} ${nameMethod} (OUT) <<< Error with the proposal to invoke function >>>`);
					var msg = 'Some proposal to invoke function was bad, you network looks like very bad';
					reject(msg);
				}
			})
			.catch(err =>{
				log.error(`${nameModule} ${nameMethod} (OUT) <<< Error invoking function >>> -> ${fcn}`);
        log.error(`${nameModule} ${nameMethod} (OUT) <<< Error invoking function >>> -> ${err}`);
				reject(err);
			})
		})
    .catch(err =>{
      log.error(`${nameModule} ${nameMethod} (OUT) <<< Error invoking function >>> -> ${fcn}`);
      reject('Not user found');
    })
	})
};

exports.invokeChaincode = invokeChaincode;
