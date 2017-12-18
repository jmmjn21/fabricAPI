var util = require('util');
var fs = require('fs');
var path = require('path');
var config = require('../../config.js');
var helper = require('../helpers/helper.js');
var users = require('./users.js');
var Log = require( 'log' ),
  log = new Log( config.logLevel ); // debug, info, error
//Attempt to send a request to the orderer with the sendCreateChain method
var nameModule = '[Create-channel]'

var createChannel = function(channelName, channelConfigPath, username, orgName) {
	var nameMethod = '[createChannel]'
  log.info(`${nameModule} ${nameMethod} Creating channel -> ${channelName}`);
  var network = helper.initNetworkStructure(orgName, channelName);
  var client = network.client;
  var channel = network.channel;
	// read in the envelope for the channel config raw bytes
	var envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
	// extract the channel config bytes from the envelope to be signed
	var channelConfig = client.extractChannelConfig(envelope);

	return new Promise((resolve, reject) => {
    users.getOrgAdmin(orgName, client)
		.then(admin => {
			log.debug(`${nameModule} ${nameMethod} Successfully obtenied admin user for -> ${orgName}`);
			// sign the channel config bytes as "endorsement", this is required by
			// the orderer's channel creation policy
			var signature = client.signChannelConfig(channelConfig);

			var request = {
				config: channelConfig,
				signatures: [signature],
				name: channelName,
				orderer: channel.getOrderers()[0],
				txId: client.newTransactionID()
			};
			client.createChannel(request)
			.then(created =>{
				log.info(`${nameModule} ${nameMethod} Channel created successfully`);
				resolve(created);
			})
			.catch(err =>{
				log.error(`${nameModule} ${nameMethod} Error creating channel -> ${channelName}`);
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

exports.createChannel = createChannel;
