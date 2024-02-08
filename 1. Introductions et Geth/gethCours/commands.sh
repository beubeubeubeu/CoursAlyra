# ----------------

# Tentative en local, sans le serveur. OK !

# node 1 pk
0x24b807ef460546e044E804E4c55BbE8dbAc2DCbC

geth init --datadir . lovelace.json

# node 1
########## node 1 lancement de geth
geth --datadir . --syncmode 'full' --networkid '151617' --port '30303' --http.addr '127.0.0.1' --http.port '8545' --http.api 'personal,eth,net,web3,txpool,miner,admin,clique' --password pwd.txt --nodiscover --miner.gasprice '0' --allow-insecure-unlock --unlock '0x24b807ef460546e044E804E4c55BbE8dbAc2DCbC' --miner.etherbase "0x24b807ef460546e044E804E4c55BbE8dbAc2DCbC" --mine --bootnodes "enode://838afbd9dbee5eb72bd9c71e4c70f9dd82a7ee629cd796471aa1692977e7bc75af5c35231c5635f417cb13483a9f28499235ac044f8b68dc9926e910c7ea24d2@127.0.0.1:30306?discport=0"
########## sans bootnode
geth --datadir . --port "30303" --http --http.addr "127.0.0.1" --http.port "8545" --http.api "personal,eth,net,web3,txpool,miner" --networkid 151617 --miner.gasprice "0" --allow-insecure-unlock --unlock "0x24b807ef460546e044E804E4c55BbE8dbAc2DCbC" --password pwd.txt --mine --miner.etherbase "0x24b807ef460546e044E804E4c55BbE8dbAc2DCbC"

=> "enode://c467ea96c60c78f312da9e0e0d27b3c87e8aa1cc923af541040312456c6a04c15303d346fa88ab4edebc5677bd2642f231115b9f7026a49c4fa70f08ac907391@127.0.0.1:30303?discport=0"

##############################################################################################################################

# node 2 pk
0xd6A9cEeee23461ba55B083320C91606d05FDA64f

# node 2
########## node 2 lancement de geth
geth --datadir . --syncmode 'full' --port '30306' --networkid '151617' --mine --miner.gasprice '0' --allow-insecure-unlock --unlock '0xd6A9cEeee23461ba55B083320C91606d05FDA64f' --password pwd.txt --nodiscover --miner.etherbase "0xd6A9cEeee23461ba55B083320C91606d05FDA64f" --authrpc.port '8553' --http.addr '127.0.0.1' --http.port '8546' --http.api 'personal,eth,net,web3,txpool,miner,admin,clique' --bootnodes "enode://c467ea96c60c78f312da9e0e0d27b3c87e8aa1cc923af541040312456c6a04c15303d346fa88ab4edebc5677bd2642f231115b9f7026a49c4fa70f08ac907391@127.0.0.1:30303?discport=0"
########## sans bootnode
geth --datadir . --port "30306" --http --http.addr "127.0.0.1" --http.port "8546" --http.api "personal,eth,net,web3,txpool,miner" --networkid 151617 --miner.gasprice "0" --allow-insecure-unlock --unlock "0xd6A9cEeee23461ba55B083320C91606d05FDA64f" --password pwd.txt --mine --miner.etherbase "0xd6A9cEeee23461ba55B083320C91606d05FDA64f"  --authrpc.port '8553'

=> block sealing failed unauthorized signer

enode 2 "enode://838afbd9dbee5eb72bd9c71e4c70f9dd82a7ee629cd796471aa1692977e7bc75af5c35231c5635f417cb13483a9f28499235ac044f8b68dc9926e910c7ea24d2@127.0.0.1:30306?discport=0"

geth attach --datadir .
admin.addPeer("enode://c467ea96c60c78f312da9e0e0d27b3c87e8aa1cc923af541040312456c6a04c15303d346fa88ab4edebc5677bd2642f231115b9f7026a49c4fa70f08ac907391@127.0.0.1:30303?discport=0")

# node 1
geth attach --datadir .
clique.getSigners()
["0x24b807ef460546e044e804e4c55bbe8dbac2dcbc"]
clique.propose("0xd6A9cEeee23461ba55B083320C91606d05FDA64f", true)

=> erreur de signers

web3.eth.sendTransaction({from:eth.coinbase,to:"0xd6A9cEeee23461ba55B083320C91606d05FDA64f",value:web3.toWei(300,"ether")})
"0x0fa409b083ef2b4d6e3c99f4ebf71c55a2b2bbf6e6a58ab792d85fd71ae85d6d"

##############################################################################################################################

########## node 3 pk
0x14B40F34e5b1d39Df9Fcc2Af69217409f8ef229C

########## node 3 lancement de geth
geth --datadir . --syncmode 'full' --port '30308' --networkid '151617' --mine --miner.gasprice '0' --allow-insecure-unlock --unlock '0x14B40F34e5b1d39Df9Fcc2Af69217409f8ef229C' --password pwd.txt --nodiscover --miner.etherbase "0x14B40F34e5b1d39Df9Fcc2Af69217409f8ef229C" --authrpc.port '8555' --http.addr '127.0.0.1' --http.port '8547' --http.api 'personal,eth,net,web3,txpool,miner,admin,clique' --bootnodes "enode://c467ea96c60c78f312da9e0e0d27b3c87e8aa1cc923af541040312456c6a04c15303d346fa88ab4edebc5677bd2642f231115b9f7026a49c4fa70f08ac907391@127.0.0.1:30303?discport=0"

admin.addPeer("enode://6729ee85de3bf9067e96c84aa7be08fc0b946a0129a179df119063755d7aabfcacfd2b5fd922fb5abf458692f2c5c6858d5cffb52aa783e7314b5fb88129c9b0@127.0.0.1:30308?discport=0")
clique.propose("0x14B40F34e5b1d39Df9Fcc2Af69217409f8ef229C", true)

################################################################################################################################

=> OK avec 3 noeuds, à vérifier si en POA il ne faut pas un minimum de 3 signers
=> avant on avait ça "err="signed recently, must wait for others"" et ça n'avançait pas

# Bizarre

{
  inturnPercent: 98.4375,
  numBlocks: 64,
  sealerActivity: {
    0x14b40f34e5b1d39df9fcc2af69217409f8ef229c: 2,
    0x24b807ef460546e044e804e4c55bbe8dbac2dcbc: 31,
    0xd6a9ceeee23461ba55b083320c91606d05fda64f: 31
  }
}

> clique.status()
{
  inturnPercent: 98.4375,
  numBlocks: 64,
  sealerActivity: {
    0x14b40f34e5b1d39df9fcc2af69217409f8ef229c: 3,
    0x24b807ef460546e044e804e4c55bbe8dbac2dcbc: 30,
    0xd6a9ceeee23461ba55b083320c91606d05fda64f: 31
  }
}

> clique.status()
{
  inturnPercent: 98.4375,
  numBlocks: 64,
  sealerActivity: {
    0x14b40f34e5b1d39df9fcc2af69217409f8ef229c: 4,
    0x24b807ef460546e044e804e4c55bbe8dbac2dcbc: 30,
    0xd6a9ceeee23461ba55b083320c91606d05fda64f: 30
  }
}


########### OLD
########### OLD
########### OLD
########### OLD


geth --datadir . --syncmode 'full' --networkid '12345999666' --port "30303" --http --http.addr 'localhost' --http.port "8545" --http.api 'personal,eth,net,web3,txpool,miner,admin,clique' --nodiscover --mine --miner.gasprice '0' --allow-insecure-unlock --unlock "f71a119152ee5a6386ff4c9ce3dd4fcc7232be97" --password SECRET.txt --miner.etherbase "f71a119152ee5a6386ff4c9ce3dd4fcc7232be97"

# Exo distant server

# Server public key

=> 0x80c8C9598298db07bF32FA1A62130773ac99DAE7

# Server chain id

=> 131415

# Server network name

=> lovelace2

# Groupe 2
# ssh ubuntu@37.187.54.46
# Nom d'utilisateur : ubuntu
# Mot de passe :      EQDmVmaQ9ZAz


# server
geth --datadir . --syncmode 'full' --networkid '131415' --port '30303' --http.addr '37.187.54.46' --http.port '8545' --http.api 'personal,eth,net,web3,txpool,miner,admin,clique' --nodiscover --mine --miner.gasprice '9000000000000' --allow-insecure-unlock --unlock '0x80c8C9598298db07bF32FA1A62130773ac99DAE7' --password pwd.txt --miner.etherbase "0x80c8C9598298db07bF32FA1A62130773ac99DAE7"

=> Started P2P networking self="enode://990814086ba1d4ff23a1d9d5dae94411f1449595415d70385409a6f8c1a3509ac6ac8abfb8a1fc906a8112682b29b3d001a5f636e21cd959efd4108fdaccbf19@127.0.0.1:30308?discport=0"
=> "enode://990814086ba1d4ff23a1d9d5dae94411f1449595415d70385409a6f8c1a3509ac6ac8abfb8a1fc906a8112682b29b3d001a5f636e21cd959efd4108fdaccbf19@37.187.54.46:30308?discport=0"
=> "enode://990814086ba1d4ff23a1d9d5dae94411f1449595415d70385409a6f8c1a3509ac6ac8abfb8a1fc906a8112682b29b3d001a5f636e21cd959efd4108fdaccbf19@127.0.0.1:30308?discport=0"

=> Réseau distant lancé, mine des blocks et a mis à dispo son réseau RPC

# Local public key

=> 0xEfa7C64Af53DFec163D9455fAA3EF47424D01166

# scp ubuntu@37.187.54.46:lovelace2/lovelace2.json .


# local
geth --datadir . --syncmode 'full' --port '30303' --networkid '131415' --mine --miner.gaslimit '9000000000000' --allow-insecure-unlock --unlock '0xEfa7C64Af53DFec163D9455fAA3EF47424D01166' --password pwd.txt --nodiscover --miner.etherbase "0xEfa7C64Af53DFec163D9455fAA3EF47424D01166"

=> err="unauthorized signer"

geth attach --datadir .

=> admin => peers [] => admin.addPeer("enode://990814086ba1d4ff23a1d9d5dae94411f1449595415d70385409a6f8c1a3509ac6ac8abfb8a1fc906a8112682b29b3d001a5f636e21cd959efd4108fdaccbf19@37.187.54.46:30308?discport=0")

admin.addPeer("enode://990814086ba1d4ff23a1d9d5dae94411f1449595415d70385409a6f8c1a3509ac6ac8abfb8a1fc906a8112682b29b3d001a5f636e21cd959efd4108fdaccbf19@37.187.54.46:30308?discport=0")

geth attach http://37.187.54.46:8545