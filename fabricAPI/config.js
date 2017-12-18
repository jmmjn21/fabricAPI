
module.exports = {
	orgs: {
		"orderer": {
			"url": "grpcs://192.168.99.100:7050",
			"server-hostname": "orderer.mansilla.com",
			"tls_cacerts": "../../artifacts/channel/crypto-config/ordererOrganizations/mansilla.com/orderers/orderer.mansilla.com/tls/ca.crt"
		},
		"org1": {
			"name": "peerOrg1",
			"mspid": "Org1MSP",
			"ca": "https://192.168.99.100:7054",
			"admin": {
				"key": "../../artifacts/channel/crypto-config/peerOrganizations/org1.mansilla.com/users/Admin@org1.mansilla.com/msp/keystore",
				"cert": "../../artifacts/channel/crypto-config/peerOrganizations/org1.mansilla.com/users/Admin@org1.mansilla.com/msp/signcerts"
			}
		},
		"org2": {
			"name": "peerOrg2",
			"mspid": "Org2MSP",
			"ca": "https://192.168.99.100:8054",
			"admin": {
				"key": "../../artifacts/channel/crypto-config/peerOrganizations/org2.mansilla.com/users/Admin@org2.mansilla.com/msp/keystore",
				"cert": "../../artifacts/channel/crypto-config/peerOrganizations/org2.mansilla.com/users/Admin@org2.mansilla.com/msp/signcerts"
			}
		},
		"org3": {
			"name": "peerOrg3",
			"mspid": "Org3MSP",
			"ca": "https://192.168.99.100:9054",
			"admin": {
				"key": "../../artifacts/channel/crypto-config/peerOrganizations/org3.mansilla.com/users/Admin@org3.mansilla.com/msp/keystore",
				"cert": "../../artifacts/channel/crypto-config/peerOrganizations/org3.mansilla.com/users/Admin@org3.mansilla.com/msp/signcerts"
			}
		}
	},
	admins:[
		 {
				"username":"admin",
				"secret":"adminpw"
		 }
	],
	keyValueStore: "/tmp/fabric-client-kvs",
	eventWaitTime: 30000,
	CC_SRC_PATH: "../../chaincode",
	logLevel: 'debug'
}
