'use strict';
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var helper = require('../helpers/helper.js');
var config = require('../../config.js');
var copService = require('fabric-ca-client');
var User = require('fabric-client/lib/User.js');
var hfc = require('fabric-client');
var Log = require( 'log' ),
  log = new Log( config.logLevel ); // debug, info, error
//Attempt to send a request to the orderer with the sendCreateChain method
var ORGS = config.orgs;

var nameModule = '[Users]'

var getOrgAdmin = function(orgName, client) {
	var admin = ORGS[orgName].admin;
	var keyPath = path.join(__dirname, admin.key);
	var keyPEM = Buffer.from(helper.readAllFiles(keyPath)[0]).toString();
	var certPath = path.join(__dirname, admin.cert);
	var certPEM = helper.readAllFiles(certPath)[0].toString();

	var cryptoSuite = hfc.newCryptoSuite();
	if (orgName) {
		cryptoSuite.setCryptoKeyStore(hfc.newCryptoKeyStore({path: config.keyValueStore + '_' + ORGS[orgName].name}));
		client.setCryptoSuite(cryptoSuite);
	}
	return hfc.newDefaultKeyValueStore({
		path: config.keyValueStore + '_' + ORGS[orgName].name
	}).then((store) => {
		client.setStateStore(store);

		return client.createUser({
			username: 'peer'+orgName+'Admin',
			mspid: ORGS[orgName].mspid,
			cryptoContent: {
				privateKeyPEM: keyPEM,
				signedCertPEM: certPEM
			}
		});
	});
};

var getUser = function(username, orgName, client){
  var nameMethod = '[getUserToSign]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Getting user to sign >>> -> ${username}`);
  return new Promise((resolve, reject) => {
    hfc.newDefaultKeyValueStore({
      path: config.keyValueStore + '_' + ORGS[orgName].name
    })
    .then(store =>{
      client.setStateStore(store);
      client._userContext = null;
      client.getUserContext(username, true)
      .then(user =>{
        if (user && user.isEnrolled()) {
  				log.debug(`${nameModule} ${nameMethod} (OUT) <<< Got user to sign >>> -> ${username}`);
  				resolve(user);
  			}
        else{
          log.error(`${nameModule} ${nameMethod} (OUT) <<< Not found user to sign in >>> -> ${username}`);
          reject();
        }
      })
      .catch(err =>{
        log.error(`${nameModule} ${nameMethod} (OUT) <<< Error getting user to sign >>> -> ${JSON.stringify(err)}`);
        reject(err);
      })
    })
  })
}

function registerAdmin(userName, orgName){
  var nameMethod = '[registerAdmin]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Registring admin user >>> -> ${userName} into Org -> ${orgName} `);
  var client = helper.initNetworkStructure(orgName, 'none').client;
  return new Promise((resolve, reject) => {
    var nameMethod = '[registerAdmin]';
    var users = config.admins;
    var username = users[0].username;
    var password = users[0].secret;
    var caUrl = ORGS[orgName].ca;
    var caClient = new copService(caUrl, null /*defautl TLS opts*/, '' /* default CA */, client.getCryptoSuite());
    hfc.newDefaultKeyValueStore({
  		path: config.keyValueStore + '_' + ORGS[orgName].name
  	})
    .then(store =>{
      log.debug(`${nameModule} ${nameMethod} <<< Setting users storage >>> -> ${config.keyValueStore}_${ORGS[orgName].name}`);
      client.setStateStore(store);
      log.debug(`${nameModule} ${nameMethod} <<< Enrolling admin user>>> -> ${userName}`);
      caClient.enroll({
        enrollmentID: username,
        enrollmentSecret: password
      })
      .then(errolled =>{
        log.debug(`${nameModule} ${nameMethod} <<< Enrolled admin user >>> -> ${userName}`);
        var member = new User(username);
        member.setCryptoSuite(client.getCryptoSuite());
        log.debug(`${nameModule} ${nameMethod} <<< Setting org MSPID >>> -> ${ORGS[orgName].mspid}`);
        member.setEnrollment(errolled.key, errolled.certificate, ORGS[orgName].mspid)
        .then(() =>{
          return client.setUserContext(member);
        })
        .then(() =>{
          log.debug(`${nameModule} ${nameMethod} (OUT) <<< Registried admin user succesfully >>>`);
          resolve(client);
        })
        .catch(err =>{
          log.error(`${nameModule} ${nameMethod} (OUT) <<< Error registring admin user >>> -> ${JSON.stringify(err)}`);
          reject(err);
        })
      })
      .catch(err =>{
        log.error(`${nameModule} ${nameMethod} (OUT) <<< Error registring admin user >>> -> ${JSON.stringify(err)}`);
        reject(err);
      })
    })
  })
}

var enrollUser = function(userName, orgName, department){
  var nameMethod = '[enrollUser]'
  log.info(`${nameModule} ${nameMethod} (IN) <<< Enrolling user >>> -> ${userName} into Org -> ${orgName}`);
  return new Promise((resolve, reject) => {
    var client = helper.initNetworkStructure(orgName, 'none').client;
    log.debug(`${nameModule} ${nameMethod} <<< Getting admin user credentials >>> -> ${JSON.stringify(config.admins)}`);
    var admins = config.admins;
    var adminName = admins[0].username;
    hfc.newDefaultKeyValueStore({
      path: config.keyValueStore + '_' + ORGS[orgName].name
    })
    .then(store =>{
      log.debug(`${nameModule} ${nameMethod} <<< Setting users storage >>> -> ${config.keyValueStore}_${ORGS[orgName].name}`);
      getUser(adminName, orgName, client)
      .then(adminUser =>{
        var caUrl = ORGS[orgName].ca;
        var caClient = new copService(caUrl, null /*defautl TLS opts*/, '' /* default CA */, client.getCryptoSuite());
        log.debug(`${nameModule} ${nameMethod} <<< Registering user>>> -> ${userName} into org -> ${orgName}`);
        caClient.register({
          enrollmentID: userName,
          affiliation: orgName + '.' + department
        }, adminUser)
        .then(secret =>{
          log.debug(`${nameModule} ${nameMethod} <<< Registered user>>> -> ${userName} into org -> ${orgName}`);
          log.debug(`${nameModule} ${nameMethod} <<< Enrolling user>>> -> ${userName} into org -> ${orgName}`);
          caClient.enroll({
            enrollmentID: userName,
            enrollmentSecret: secret
          })
          .then(message =>{
            if (message && typeof message === 'string' && message.includes('Error:')) {
              log.error(`${nameModule} ${nameMethod} (OUT) <<< Error enrolling user >>> -> ${JSON.stringify(message)}`);
              reject(message);
            }
            else{
              var member = new User(userName);
              member._enrollmentSecret = secret;
              member.setEnrollment(message.key, message.certificate, ORGS[orgName].mspid)
              .then(() =>{
                return client.setUserContext(member);
              })
              .then(() =>{
                log.debug(`${nameModule} ${nameMethod} (OUT) <<< Enrolled user succesfully >>>`);
                resolve(member);
              })
              .catch(err =>{
                log.error(`${nameModule} ${nameMethod} (OUT) <<< Error enrolling user >>> -> ${JSON.stringify(err)}`);
                reject(err);
              })
            }
          })
          .catch(err =>{
            log.error(`${nameModule} ${nameMethod} (OUT) <<< Error enrolling user >>> -> ${JSON.stringify(err)}`);
            reject(err);
          })
        })
        .catch(err =>{
          log.error(`${nameModule} ${nameMethod} (OUT) <<< Error enrolling user >>> -> ${JSON.stringify(err)}`);
          reject(err);
        })
      })
      .catch(err =>{
        log.error(`${nameModule} ${nameMethod} (OUT) <<< Error enrolling user >>> -> ${JSON.stringify(err)}`);
        reject(err);
      })
    })
  })
}

module.exports= {
  registerAdmin,
  enrollUser,
  getUser,
  getOrgAdmin
}
