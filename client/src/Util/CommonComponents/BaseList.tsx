import React, { FunctionComponent } from 'react';
import { View, Text, StyleSheet } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import VerifiedIcon from './VerifiedIcon';
import { EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import { THEME_COLORS } from './Colors';

//style sheet
const style = StyleSheet.create({
    title: {
        fontWeight: "bold",
        color: "grey",
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 10
    }
})

export type listtype = {
    id: string;
    name: string;
    avatar_url: string;
    verified?: 'Y' | 'N';
    subtitle?: string;
    checked?: boolean;
    content?: React.ReactNode;
}

type BaseListProps = {
    title?: string,
    items: listtype[],
    onAvatarClick?: (id: string) => any,
    //this is required if renderBasedOnCheckbox is set to true
    itemOnPress?: (item: listtype, index: number) => any,
    itemOnLongPress?: (item: listtype, index: number) => any,
    checkBoxes?: boolean   
}

const BaseList:FunctionComponent<BaseListProps> = (props) => {
    let {
        title = '',
        items = [],
        onAvatarClick = (id: string) => {},
        itemOnPress = (item: listtype, index: number) => {},
        itemOnLongPress = (item: listtype, index: number) => {},
        checkBoxes = false
    } = props;
    
    return (
        <>
        {items.length > 0 && title.length > 0 && <Text style={style.title}>{title}</Text>}
        {items.map((l, i) => (
            <ListItem
              key={i}
              onPress={(e) => itemOnPress(l, i)}
              onLongPress={e => itemOnLongPress(l, i)}
            >
                <Avatar 
                    rounded 
                    size="medium" 
                    source={{ uri: l.avatar_url || EMPTY_IMAGE_DIRECTORY }}
                    onPress={() => onAvatarClick(l.id)}
                />
                <ListItem.Content>
                    <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                        <ListItem.Title>{l.name}</ListItem.Title>
                        {l.verified && l.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                    </View>
                    {l.subtitle && <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>}
                </ListItem.Content>
                {checkBoxes &&
                <ListItem.CheckBox 
                    checked={l.checked} 
                    checkedIcon={<Ionicons name="checkmark-circle" size={25} color={THEME_COLORS.ICON_COLOR}/>} 
                    uncheckedIcon={<Ionicons name="checkmark-circle-outline" size={25} color={THEME_COLORS.ICON_COLOR}/>}
                    onPress={() => itemOnPress(l, i)}/>
                }
                {l.content &&
                    <View style={{ alignSelf: 'flex-end' }}>
                        {l.content}
                    </View>
                }
            </ListItem>
          ))}
        </>
    )
}

export default BaseList