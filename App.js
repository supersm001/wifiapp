import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  subscribeOnConnectionInfoUpdates,
  subscribeOnThisDeviceChanged,
  subscribeOnPeersUpdates,
  connect,
  cancelConnect,
  createGroup,
  removeGroup,
  getAvailablePeers,
  sendFile,
  receiveFile,
  getConnectionInfo,
  getGroupInfo,
  receiveMessage,
  sendMessage,
} from 'react-native-wifi-p2p';
import FIcons from 'react-native-vector-icons/FontAwesome';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [groupFlag, setGroupFlag] = useState(false);
  const [devices, setDevices] = useState([]);
  // const [devices, setDevices] = useState([
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  //   {"deviceAddress": "02:0a:f5:7f:2c:1b", "deviceName": "ASUS_Z012D_1594", "isGroupOwner": true, "primaryDeviceType": "10-0050F204-5", "secondaryDeviceType": null, "status": 3},
  // ]);
  const [zoneName, setZoneName] = useState("-");
  const [zonePasscode, setZonePasscode] = useState("********");
  const [zoneAddress, setZoneAddress] = useState("00:00:00:00:00:00");

  useEffect(() => {
    permissions();
    const subscription = subscribeOnPeersUpdates(({devices}) => {
      console.log(`New devices available: ${devices}`);
      setDevices(devices);
    });
    const subscription2 = subscribeOnConnectionInfoUpdates(event => {
      console.log('Connection Info Updates: ', event);
      if(event.groupFormed){
        setZoneAddress(event.groupOwnerAddress.hostAddress);
      }else if(event.groupFormed){
        setZoneName("-");
        setZoneAddress("00:00:00:00:00:00");
        setZonePasscode("********");
      }

    });
    const subscription3 = subscribeOnThisDeviceChanged(event => {
      console.log('This device changed: ', event);
    });

    function SubscriptionStop() {
      subscription.remove();
      subscription2.remove();
      subscription3.remove();
    }

    return SubscriptionStop;
  }, []);

  async function permissions() {
    await initialize()
      .then(success => {
        ToastAndroid.show('initialization Success', ToastAndroid.SHORT);
      })
      .catch(e => {
        ToastAndroid.show('initialization failed!!!', ToastAndroid.SHORT);
      });
    // since it's required in Android >= 6.0
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
        title: 'Access to wi-fi P2P mode',
        message: 'ACCESS_COARSE_LOCATION',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      ToastAndroid.show('Using P2P Mode', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('p2p Mode Not Working!!!', ToastAndroid.SHORT);
    }
  }

  function FindDevices() {
    startDiscoveringPeers()
      .then(() => {
        ToastAndroid.show('Searching...', ToastAndroid.SHORT);
        setLoading(true);
      })
      .catch(err =>{

        ToastAndroid.show(
          `Something is gone wrong. Maybe your WiFi is disabled? Error details: ${err}`,
          ToastAndroid.LONG,
          );
          console.log("Find Error : ",err);
        }
      );
  }
  function StopFinding() {
    stopDiscoveringPeers()
      .then(() => {
        ToastAndroid.show('Searching Stopped!', ToastAndroid.SHORT);
        setLoading(false);
      })
      .catch(err =>
        ToastAndroid.show(
          `Something is gone wrong. Maybe your WiFi is disabled? Error details: ${err}`,
          ToastAndroid.LONG,
        ),
      );
  }

  function RealTimeDevices() {
    getAvailablePeers().then(({devices}) =>{
      console.log("real time devices : ",devices);
      if(devices.length>0){
        setDevices(devices);
      }
      
    } 
    );
  }

  function ConnectToDevice(id) {
    connect(id)
      .then(() =>
        ToastAndroid.show('Successfully connected!!!', ToastAndroid.LONG),
      )
      .catch(err =>
        ToastAndroid.show(
          `Something gone wrong. Details: ${err}`,
          ToastAndroid.LONG,
        ),
      );
  }
  function CancelConnect() {
    cancelConnect()
      .then(() =>
        ToastAndroid.show(
          'Connection successfully canceled!!!',
          ToastAndroid.LONG,
        ),
      )
      .catch(err =>
        ToastAndroid.show(
          `Something gone wrong. Details: ${err}`,
          ToastAndroid.LONG,
        ),
      );
  }
  function Disconnect() {
    getGroupInfo()
      .then(() => removeGroup())
      .then(() =>
        ToastAndroid.show('Successfully Disconnected!!!', ToastAndroid.LONG),
      )
      .catch(err =>
        ToastAndroid.show(
          `Something gone wrong. Details: ${err}`,
          ToastAndroid.LONG,
        ),
      );
  }

  function CreateGroup() {
    createGroup()
      .then(() =>{
        ToastAndroid.show('Group Created Successfully !', ToastAndroid.LONG),
        setGroupFlag(true);
        setTimeout(() => {
          // getGroupPassphraseInfo().then(passphrase => console.log("Group Passcode : ",passphrase));
          GetGroupInfo();
        }, 3000);
      }
      )
      .catch(err => console.error('Something gone wrong. Details: ', err));
  }

  function CreateGroupWithPassWord() {
    createGroup()
      .then(() => {
        ToastAndroid.show('Group Created Successfully !', ToastAndroid.LONG);
        setGroupFlag(true);
        setTimeout(() => {
          // getGroupPassphraseInfo().then(passphrase => console.log("Group Passcode : ",passphrase));
          GetGroupInfo();
        }, 3000);
      })
      .catch(err => console.error('Something gone wrong. Details: ', err));
  }

  function RemoveGroup() {
    removeGroup()
      .then(() =>{
        ToastAndroid.show('Group Left !!!', ToastAndroid.LONG)
        setGroupFlag(false);
        setZoneName("-");
        setZoneAddress("00:00:00:00:00:00");
        setZonePasscode("********");
      } 
      )
      .catch(err => console.error('Something gone wrong. Details: ', err));
  }

  function GetGroupInfo() {
    getGroupInfo()
      .then(info => {
        console.log('Group Info : ', info)
        setZoneName(info.networkName);
        // setZoneAddress(info.owner.deviceAddress);
        setZonePasscode(info.passphrase);
      }
        )
      .catch(err => console.error('Something gone wrong. Details: ', err));
  }

  return (
    <View style={styles.Page}>
      <View style={styles.Header}>
        <Text style={styles.Header_Title}>WDU CONSOLE</Text>
        <TouchableOpacity style={styles.Menu_Icon}>
          <FIcons name="navicon" size={40} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.WIFI_Icon}>
          {loading ? (
            <ActivityIndicator animating={true} color="#FFF" size="large" />
          ) : (
            <FIcons name="wifi" size={40} color="#FFF" />
          )}
        </View>
      </View>
      <View style={styles.Controller}>
        <View style={styles.Row}>
          <View style={styles.Sec_1}>
          <Text style={styles.Title_Text}>My Zone</Text>
            <TouchableOpacity
              disabled={groupFlag}
              activeOpacity={0.5}
              onPress={() => {
                // CreateGroupWithPassWord();
                CreateGroup();
              }}
              style={groupFlag ? styles.Disabled_Button : styles.Button}>
              <Text style={styles.Button_Text}>ACTIVATE</Text>
            </TouchableOpacity>
            <View style={{height: 10}}></View>
            <TouchableOpacity
              disabled={!groupFlag}
              activeOpacity={0.5}
              onPress={() => {
                RemoveGroup();
              }}
              style={!groupFlag ? styles.Disabled_Button : styles.Button}>
              <Text style={styles.Button_Text}>SHUT DOWN</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.Sec_1}>
            <Text style={styles.Title_Text}>Find Device</Text>
            <TouchableOpacity
              disabled={loading}
              activeOpacity={0.5}
              onPress={() => {
                FindDevices();
              }}
              style={loading ? styles.Disabled_Button : styles.Button}>
              <Text style={styles.Button_Text}>START</Text>
            </TouchableOpacity>
            <View style={{height: 10}}></View>
            <TouchableOpacity
              disabled={!loading}
              activeOpacity={0.5}
              onPress={() => {
                StopFinding();
              }}
              style={!loading ? styles.Disabled_Button : styles.Button}>
              <Text style={styles.Button_Text}>STOP</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.Row}>
          <View style={styles.Sec_1}>
          <Text style={styles.Title_Text}>Zone Info</Text>
          <Text style={styles.Value_Text}>Name</Text>
          <Text style={styles.Value_Text}>{zoneName}</Text>
          <Text style={styles.Value_Text}>Address</Text>
          <Text style={styles.Value_Text}>{zoneAddress}</Text>
          <Text style={styles.Value_Text}>Passcode</Text>
          <Text style={styles.Value_Text}>{zonePasscode}</Text>
          </View>
          <View style={styles.Sec_1}>
            <TouchableOpacity
              disabled={!loading}
              activeOpacity={0.5}
              onPress={() => {
                RealTimeDevices();
              }}
              style={!loading ? styles.Disabled_Button : styles.Button}>
              <Text style={styles.Button_Text}>Available Devices</Text>
            </TouchableOpacity>
            <View style={{height:10}}></View>
            <TouchableOpacity
              disabled={!groupFlag}
              activeOpacity={0.5}
              onPress={() => {
                GetGroupInfo();
              }}
              style={!groupFlag ? styles.Disabled_Button : styles.Button}>
              <Text style={styles.Button_Text}>Get Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.List}>
        <View style={styles.List_Header}>
          <Text style={styles.Title_Text_2}>Devices Found</Text>
        </View>
        <View style={{flex:1,width:'100%',paddingVertical:5}}>
        <FlatList
          style={{width: '100%',flex:1}}
          data={devices}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity activeOpacity={0.5} key={index} style={styles.List_Item}>
                <View style={{flex:1}}>
                <Text numberOfLines={1} style={styles.List_Item_Name}>{item.deviceName}</Text>
                <Text style={styles.List_Item_Address}>{item.deviceAddress}</Text>
                  </View>
                  <View style={{marginLeft:10}}>
                  <FIcons name="wifi" size={20} color="#FFF" />
                    </View>
              </TouchableOpacity>
            );
          }}
        />
        </View>
      </View>
    </View>
  );
};
export default App;

const styles = StyleSheet.create({
  Page: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFF',
  },
  Header: {
    height: 80,
    width: '100%',
    elevation: 5,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Menu_Icon: {
    position: 'absolute',
    left: 0,
    height: 80,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  WIFI_Icon: {
    position: 'absolute',
    right: 0,
    height: 80,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  Header_Title: {
    fontSize: 25,
    color: '#FFF',
    fontWeight: 'bold',
  },
  Button: {
    paddingVertical: 10,
    width: '80%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#3498DB',
    elevation: 5,
  },
  Disabled_Button: {
    paddingVertical: 10,
    width: '80%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'gray',
    elevation: 5,
  },
  Button_Text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  Controller: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF',
    padding: 10,
    // alignItems:'center',
    // justifyContent:'center'
  },
  Row: {
    flexDirection: 'row',
    height: '50%',
    width: '100%',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  Sec_1: {
    height: '100%',
    width: '48%',
    // backgroundColor:'#3498DB30',
    borderRadius: 30,
    // borderWidth:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Stop_Button: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 100,
  },
  List: {
    height: '40%',
    width: '90%',
    marginHorizontal: '5%',
    marginVertical: '5%',
    backgroundColor: '#EBF5FB',
    // borderWidth:1,
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  List_Item: {
    width: '94%',
    marginHorizontal: '3%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#3498DB',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 5,
    flexDirection:'row',
    alignItems:'center'
  },
  Title_Text: {
    color: '#888888',
    fontWeight: '400',
    fontSize: 14,
    marginBottom: 10,
  },
  List_Header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgray',
  },
  Title_Text_2: {
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  Value_Text: {
    color: '#444',
    fontWeight: '500',
    fontSize: 14,
  },
  List_Item_Name:{
    color:'#FFF',
    fontSize:14,
    fontWeight:'700'
  },
  List_Item_Address:{
    color:'#fafafa',
    fontSize:12,
    fontWeight:'500'
  }
});
