import React, { FunctionComponent } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';

type GroupAvatarProps = {
    verified: "Y" | "N",
    name: string,
    avatar?: string,
    member_count?: number,
    size?: number,
    style?: any,
    onPress?: () => any
}

const GroupAvatar:FunctionComponent<GroupAvatarProps> = (props) => {
    let { avatar, member_count = 0, verified = "N", name, size = 55, style = {}, onPress = () => {} } = props;
    const useCounter = verified === "N" && member_count > 2

    return (
        <TouchableOpacity 
            style={[style, { alignItems: 'center', justifyContent: 'center' }]}
            onPress={onPress}
        >
            {verified === "N" ?
                <View style={{ width: size }}>
                    <Image
                        source={{ uri: avatar as string || EMPTY_IMAGE_DIRECTORY }}
                        style={{ width: useCounter ? size * 0.85 : size, height: useCounter ? size * 0.85 : size, borderRadius: 100, marginBottom: useCounter ? -15 : 0 }}
                    />
                </View>
                :
                <View style={{
                    width: size,
                    height: size,
                    justifyContent: "center",
                    borderRadius: size / 2,
                    backgroundColor: '#1f4e46'
                }}>
                    <Text style={{
                        alignSelf: 'center',
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: size * 10 / 55,
                    }}>{name.slice(0, 6)}</Text>
                </View>
            }
            {useCounter &&
                <View style={{
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: '#d6d6d6',
                    marginLeft: 25
                }}>
                    <Text style={{
                        alignSelf: 'center',
                        fontWeight: 'bold',
                        color: 'black',
                        fontSize: 10,
                    }}>{member_count - 1}</Text>
                </View>
            }
        </TouchableOpacity>
    )
}

export default GroupAvatar


