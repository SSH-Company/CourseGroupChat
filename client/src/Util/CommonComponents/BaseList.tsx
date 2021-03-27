import React, { FunctionComponent } from 'react';
import { View, Text, StyleSheet } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import VerifiedIcon from './VerifiedIcon';

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
    verified: 'Y' | 'N';
    subtitle?: string;
    checked?: boolean;
}

type BaseListProps = {
    title?: string,
    items: listtype[],
    itemOnPress?: (item: listtype, index: number) => any,
    checkBoxes?: boolean,
    onSelectCheckedItems?: (checkedItems: listtype[]) => any 
}

const BaseList:FunctionComponent<BaseListProps> = (props) => {
    let {
        title = '',
        items = [],
        itemOnPress = (item: listtype, index: number) => {},
        checkBoxes = false,
        onSelectCheckedItems = (items: listtype[]) => {}
    } = props;

    const toggleCheckbox = (index: number) => {
        items[index].checked = !items[index].checked;
    }

    onSelectCheckedItems(items.filter(item => item.checked === true));
    
    return (
        <>
        {title.length > 0 && <Text style={style.title}>{title}</Text>}
        {items.map((l, i) => (
            <ListItem
              key={i}
              onPress={(e) => itemOnPress(l, i)}
            >
                <Avatar rounded size="medium" source={{ uri: l.avatar_url }}/>
                <ListItem.Content>
                    <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                    <ListItem.Title>{`${l.name}`}</ListItem.Title>
                    {l.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                    </View>
                    {l.subtitle && <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>}
                </ListItem.Content>
                {checkBoxes &&
                <ListItem.CheckBox 
                    checked={l.checked} 
                    checkedIcon={<Ionicons name="checkmark-circle" size={25} color="#734f96"/>} 
                    uncheckedIcon={<Ionicons name="checkmark-circle-outline" size={25} color="#734f96"/>}
                    onPress={() => toggleCheckbox(i)}/>
                }
            </ListItem>
          ))}
        </>
    )
}

export default BaseList