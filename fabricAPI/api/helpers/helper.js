'use strict';
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var helper = require('../helpers/helper.js');
var config = require('../../config.js');
var hfc = require('fabric-client');
var Log = require( 'log' ),
  log = new Log( config.logLevel ); // debug, info, error
//Attempt to send a request to the orderer with the sendCreateChain method
var ORGS = config.orgs;

var nameModule = '[Helper]'

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir,file_name);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}

function setupPeers(channel, peers, client) {
  var nameMethod = '[setupPeers]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Setting up network peers >>> -> ${JSON.stringify(peers)}`);
	for (var peer in peers) {
    var peerData = peers[peer];
		var data = fs.readFileSync(path.join(__dirname, peerData['tls_cacerts']));
		var peer = client.newPeer(
			peerData['requests'],
			{
				pem: Buffer.from(data).toString(),
				'ssl-target-name-override': peerData['server-hostname']
			}
		);
		peer.setName('peer' + peer);
		channel.addPeer(peer);
	}
  log.info(`${nameModule} ${nameMethod} (OUT) <<< Setted up network peers >>>`);
}

function newOrderer(client) {
  var nameMethod = '[newOrderer]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Setting up orderer into the client >>>`);
	var caRootsPath = ORGS.orderer.tls_cacerts;
	var data = fs.readFileSync(path.join(__dirname, caRootsPath));
	var caroots = Buffer.from(data).toString();
  log.info(`${nameModule} ${nameMethod} (OUT) <<< Setted up orderer into the client >>>`);
	return client.newOrderer(ORGS.orderer.url, {
		'pem': caroots,
		'ssl-target-name-override': ORGS.orderer['server-hostname']
	});
}

var initNetworkStructure = function(orgName, channelName){
  var nameMethod = '[initNetworkStructure]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Initializing network settings >>> for the org -> ${orgName}`);
  var network;
  var client = new hfc();
  var cryptoSuite = hfc.newCryptoSuite();
  cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: config.keyValueStore + '_' + ORGS[orgName].name}));
  client.setCryptoSuite(cryptoSuite);
  var channel = client.newChannel(channelName);
  channel.addOrderer(newOrderer(client));
  //setupPeers(channel, orgName, client);
  network = {
    client: client,
    channel: channel
  }
  log.info(`${nameModule} ${nameMethod} (OUT) <<< Initialized network settings >>> for the org -> ${orgName}`);
  return network;
}

var prepareTargetsPeers = function(peers, orgName, client){
  var nameMethod = '[prepareTargetsPeers]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Preparing configuration peers >>> -> ${JSON.stringify(peers)}`);
  var targets = [];
  for (var peer in peers) {
    var peerData = peers[peer];
    var data = fs.readFileSync(path.join(__dirname, peerData['tls_cacerts']));
    var grpcOpts = {
      pem: Buffer.from(data).toString(),
      'ssl-target-name-override': peerData['server-hostname']
    };
    targets.push(client.newPeer(peerData['requests'], grpcOpts));
  }
  if (targets.length === 0) {
    log.debug(`${nameModule} ${nameMethod} (OUT) <<< Configuration peers not found >>>`);
  }
  log.info(`${nameModule} ${nameMethod} (OUT) <<< Returning target peers >>> -> ${JSON.stringify(targets)}`);
  return targets;
}



module.exports= {
  setupPeers,
  newOrderer,
  initNetworkStructure,
  prepareTargetsPeers,
  readAllFiles
}
