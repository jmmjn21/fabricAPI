# Hyperledger API REST Dockerized

API REST Hyperledger dockerized

### 1. Start the Hyperledger network test

We need to execute the following shell script

in the folder __fabricapi__ execute:

```shell
$ ./startNetwork.sh
```

### 2. Start up the Hyperledger API REST service

#### 2.0 Pre-requirements

We need have installed docker and docker-compose

#### 2.1 Start up

We need to execute the following command

```shell
$ docker-compose up -d
```

#### 2.2 Test the service

We test the service using Postman, so you need import to postman the environment
and collection

```file
fabricAPI.postman_collection.json
```

```file
fabricAPI.postman_environment.json
```

#### 2.3 API definition

We can find the api definition yml file in the folder
fabricAPI/api/swagger

#### 2.4 Network setting and crypto material

We can find the network setting and crypto material in the folder

```file
/fabricAPI/artifacts
```

We can create a new network configuration and crypto material in this folder

#### 2.5 Chaincodes

We can find the chaincodes sources in th following folder

```file
/fabricAPI/chaincode/test
```

We can create a new chaincodes adding a new folder under

```file
/fabricAPI/chaincode
```

For example:

```file
/fabricAPI/chaincode/myNewChaincode/myChaincodeSource
```

#### 2.6 Service configuration file

We can find the service configuration file in the folder

```file
/fabricAPI/config.js
```

In this file we can define some things like order and organizations setting. If we change the default network we need a new configuration setting
