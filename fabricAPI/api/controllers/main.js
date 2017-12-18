'use strict';

var util = require('util');
var channels = require('../services/create-channel.js');
var join = require('../services/join-channel.js');
var install = require('../services/install-chaincode.js');
var instantiate = require('../services/instantiate-chaincode.js');
var invoke = require('../services/invoke-transaction.js');
var users = require('../services/users.js');

function createChannel(req, res) {
  var channelName = req.body.channelName;
  var channelConfigPath = req.body.channelConfigPath;

  channels.createChannel(channelName, channelConfigPath, req.headers.username, req.headers.orgname)
  .then(function(message) {
    var msg = {
      channel_id: channelName
    }
    res.status(200).send(msg);
  })
  .catch(err =>{
    var msg = {
      message: err.toString()
    }
    res.status(400).send(msg);
  })
}

function joinPeers(req, res) {
	var channelName = req.swagger.params.channel_id.value;
	var peers = req.body.peers;

	join.joinChannel(channelName, peers, req.headers.username, req.headers.orgname)
	.then(function(message) {
    var msg = {
      message: 'Peers joined to channel successfully'
    }
    res.status(200).send(msg);
	})
  .catch(err =>{
    var msg = {
      message: err.toString()
    }
    res.status(400).send(msg);
  })
}

function installChaincode(req, res) {
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;

	install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, req.headers.username, req.headers.orgname)
	.then(function(message) {
    var msg = {
      message: 'Chaincode installed successfully',
      chaincode_id: chaincodeName,
      chaincode_version: chaincodeVersion
    }
    res.status(200).send(msg);
	})
  .catch(err =>{
    var msg = {
      message: err.toString()
    }
    res.status(400).send(msg);
  })
}

function instantiateChaincode(req, res) {
  var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.swagger.params.channel_id.value;
	var fcn = req.body.fcn;
	var args = req.body.args;

	instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, fcn, args, req.headers.username, req.headers.orgname)
	.then(function(message) {
    var msg = {
      chaincode_id: chaincodeName
    }
    res.status(200).send(msg);
	})
  .catch(err =>{
    var msg = {
      message: err.toString()
    }
    res.status(400).send(msg);
  })
}

function invokeChaincode(req, res) {
	var peers = req.body.peers;
	var chaincodeName = req.swagger.params.chaincode_id.value;
	var channelName = req.swagger.params.channel_id.value;
	var fcn = req.body.fcn;
	var args = req.body.args;

	invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.headers.username, req.headers.orgname)
	.then(function(message) {
    var msg = {
      response: message
    }
    res.status(200).send(msg);
	})
  .catch(err =>{
    var msg = {};
    if(err){
      msg.message = err.toString()
    }
    res.status(400).send(msg);
  })
}

function registerAdminUser(req, res) {
  var adminName = req.body.adminName;
  var orgName = req.body.orgName;
	users.registerAdmin(adminName, orgName)
	.then(function(message) {
    var msg = {
      message: 'Amin user registered successfully',
      user_name: adminName,
      org_name: orgName
    }
    res.status(200).send(msg);
	})
  .catch(err =>{
    var msg = {
      message: err.toString()
    }
    res.status(400).send(msg);
  })
}

function enrollUser(req, res) {
  var userName = req.body.userName;
  var orgName = req.body.orgName;
	users.enrollUser(userName, orgName, 'department1') //si poner algo distinto de departament1 casca
	.then(function(message) {
    var msg = {
      message: 'User enrolled successfully',
      user_name: userName,
      org_name: orgName
    }
    res.status(200).send(msg);
	})
  .catch(err =>{
    var msg = {
      message: err.toString()
    }
    res.status(400).send(msg);
  })
}

module.exports = {
  createChannel,
  joinPeers,
  installChaincode,
  instantiateChaincode,
  invokeChaincode,
  registerAdminUser,
  enrollUser

};
