var util = require('util');
var config = require('../../config.js');
var helper = require('../helpers/helper.js');
var users = require('./users.js');
var Log = require( 'log' ),
  log = new Log( config.logLevel ); // debug, info, error
//Attempt to send a request to the orderer with the sendCreateChain method
var nameModule = '[Join-channel]'

//
//Attempt to send a request to the orderer with the sendCreateChain method
//

var joinChannel = function(channelName, peers, username, orgName) {
	var nameMethod = '[joinChannel]'
  log.info(`${nameModule} ${nameMethod} Joining peers -> ${peers} to channel -> ${channelName}`);
  var network = helper.initNetworkStructure(orgName, channelName);
  var client = network.client;
  var channel = network.channel;

	return new Promise((resolve, reject) => {
    users.getOrgAdmin(orgName, client)
		.then(admin => {
			log.debug(`${nameModule} ${nameMethod} Successfully obtenied admin user for -> ${orgName}`);
			// sign the channel config bytes as "endorsement", this is required by
			// the orderer's channel creation policy
			var tx_id = client.newTransactionID();
			var request = {
				txId : 	tx_id
			};
			channel.getGenesisBlock(request)
			.then(genesis_block =>{
        var tx_id = client.newTransactionID();
				var request = {
					targets: helper.prepareTargetsPeers(peers, orgName, client),
					txId: tx_id,
					block: genesis_block
				};
				channel.joinChannel(request)
				.then(joined =>{
					if(joined[0].toString().indexOf('status: 500') > 0){
						log.error(`${nameModule} ${nameMethod} Error joining peers to channel`);
						reject(joined[0]);
					}
					else{
						log.debug(`${nameModule} ${nameMethod} Successfully joined peers to channel -> ${channelName}`);
						resolve(joined);
					}
				})
				.catch(err =>{
					log.error(`${nameModule} ${nameMethod} Error joining peers to channel -> ${channelName}`);
					reject(err);
				})
			})
			.catch(err => {
				log.error(`${nameModule} ${nameMethod} Error getting genesis block`);
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

exports.joinChannel = joinChannel;
