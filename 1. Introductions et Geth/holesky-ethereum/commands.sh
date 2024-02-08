# Pour lancer l'execution client
geth --holesky --http --http.api eth,net,engine,admin --authrpc.jwtsecret='../jwt.hex'

# Pour lancer le consensus client
./prysm.sh beacon-chain --execution-endpoint=http://localhost:8551 --holesky --jwt-secret='../jwt.hex'  --checkpoint-sync-url=https://holesky.beaconstate.info --genesis-beacon-api-url=https://holesky.beaconstate.info

/Users/hlbn/Documents/CoursAlyra/holesky-ethereum/keys/validator_keys

# Pour le validateur
./prysm.sh validator accounts import --keys-dir='/Users/hlbn/Documents/CoursAlyra/holesky-ethereum/keys/validator_keys' --holesky

# Les instructions pour reprendre https://docs.prylabs.network/docs/install/install-with-script

./prysm.sh validator --wallet-dir='/Users/hlbn/Documents/CoursAlyra/1. Introductions et Geth/holesky-ethereum/consensus/prysm-wallet-v2' --holesky --suggested-fee-recipient='0x43C34CDC00e4c9154f02F1C0346E330eBd613b69'

# Arrêter la validation

# https://docs.prylabs.network/docs/wallet/exiting-a-validator#:~:text=Voluntarily%20exiting%20your%20validator%20from,still%20be%20accessed%20that%20way.

