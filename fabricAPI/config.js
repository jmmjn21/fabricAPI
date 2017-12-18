
module.exports = {
	orgs: {
		"orderer": {
			"url": "grpcs://192.168.99.100:7050",
			"server-hostname": "orderer.example.com",
			"tls_cacerts": "../../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
		},
		"org1": {
			"name": "peerOrg1",
			"mspid": "Org1MSP",
			"ca": "https://192.168.99.100:7054",
			"admin": {
				"key": "../../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
				"cert": "../../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
			}
		},
		"org2": {
			"name": "peerOrg2",
			"mspid": "Org2MSP",
			"ca": "https://192.168.99.100:8054",
			"admin": {
				"key": "../../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore",
				"cert": "../../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts"
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
