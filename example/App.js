import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  defaultPubsubTopic,
  newNode,
  start,
  isStarted,
  stop,
  peerID,
  listenAddresses,
  connect,
  peerCnt,
  peers,
  decodeAsymmetric,
  lightpushPublishEncAsymmetric,
  WakuMessage,
  onMessage,
  StoreQuery,
  storeQuery,
  Config,
  FilterSubscription,
  ContentFilter,
  filterSubscribe,
} from '@waku/react-native';

const privateKey =
  '0x09270b5d25d87d9efbdbf875180d983cf520ab3ac7b6fb6ddc40ca4ca1018bb0';
const publicKey =
  '0x048c4250fafc245f6e52c64137602bc1c8569e40a191006ae757455b8ac90f346832d0f64a2b5d389e5d7627daeb509a5f323e4efa47ac128ae1573e337450bc0a';

export default function App() {
  const [result, setResult] = React.useState();

  React.useEffect(() => {
    (async () => {
      const nodeStarted = await isStarted();

      if (!nodeStarted) {
        console.log('Starting it up');
        let config = new Config();
        config.relay = false;
        config.filter = true;
        await newNode(config);
        await start();
      }
      console.log('The node ID:', await peerID());

      // await relaySubscribe();

      onMessage((event) => {
        setResult(
          'Message received: ' +
            event.wakuMessage.timestamp +
            ' - payload:[' +
            event.wakuMessage.payload +
            ']'
        );
        console.log('Message received: ', event);
      });

      // console.log('enoughPeers?', await relayEnoughPeers());
      console.log('addresses', await listenAddresses());
      console.log('connecting...');

      // try {
      //   await connect(
      //     '/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/30303/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm',
      //     5000
      //   );
      // } catch (err) {
      //   console.log('Could not connect to peers');
      // }

      try {
        await connect(
          '/ip4/127.0.0.1/tcp/6002/p2p/16Uiu2HAmJ2S4tgvZ2mP6RLWkyiuv9MdiYkBnw95Sj1rb3kNf47rb',
          5000
        );
      } catch (err) {
        console.log('Could not connect to peers');
      }

      console.log('connected!');

      console.log('PeerCNT', await peerCnt());
      console.log('Peers', await peers());

      let msg = new WakuMessage();
      msg.contentTopic = 'chat';
      msg.payload = new Uint8Array([1, 2, 3, 4, 5]);
      // msg.timestamp = new Date();
      msg.version = 0;

      // const result = await lightpushPublishEncAsymmetric(
      //   msg,
      //   publicKey,
      //   undefined,
      //   undefined,
      //   '16Uiu2HAmJ2S4tgvZ2mP6RLWkyiuv9MdiYkBnw95Sj1rb3kNf47rb'
      // );
      console.log(result);

      // TO RETRIEVE HISTORIC MESSAGES:
      console.log('Retrieving messages from store node');
      const query = new StoreQuery();
      query.contentFilters.push(new ContentFilter('chat'));
      const queryResult = await storeQuery(
        query,
        '16Uiu2HAmJ2S4tgvZ2mP6RLWkyiuv9MdiYkBnw95Sj1rb3kNf47rb'
      );

      const messageResult = queryResult.messages[0];
      console.log(messageResult);
      const r = await decodeAsymmetric(messageResult, privateKey);
      console.log(r);

      const filterSubs = new FilterSubscription();
      filterSubs.contentFilters.push(new ContentFilter('chat'));
      await filterSubscribe(
        filterSubs,
        '16Uiu2HAmJ2S4tgvZ2mP6RLWkyiuv9MdiYkBnw95Sj1rb3kNf47rb'
      );

      // console.log("Unsubscribing and stopping node...")

      // await relayUnsubscribe();

      // await stop(); // TODO: This must be called only once
    })();

    defaultPubsubTopic().then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <Text>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
