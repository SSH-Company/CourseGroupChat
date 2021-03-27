import React, { FunctionComponent, useState, useEffect } from 'react';
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
    verified?: 'Y' | 'N';
    subtitle?: string;
    checked?: boolean;
}

type BaseListProps = {
    title?: string,
    items: listtype[],
    
    //this is required if renderBasedOnCheckbox is set to true
    itemOnPress?: (item: listtype, index: number) => any,
    checkBoxes?: boolean,
    onSelectCheckedItems?: (items: listtype[]) => any 
    // set to true if you're planning on rendering a 
    // component based on the checked items, in that case the
    // toggle checkbox functionality needs to controlled from the
    // parent class
    renderBasedOnCheckbox?: boolean,    
}

const BaseList:FunctionComponent<BaseListProps> = (props) => {
    let {
        title = '',
        items = [],
        itemOnPress = (item: listtype, index: number) => {},
        checkBoxes = false,
        onSelectCheckedItems = (items: listtype[]) => {},
        renderBasedOnCheckbox = false
    } = props;

    const [renderItems, setRenderItems] = useState<listtype[]>([]);

    useEffect(() => {
        setRenderItems([...items]);
    }, []);

    if (!renderBasedOnCheckbox) {
        useEffect(() => {
            setRenderItems([...items]);
        }, [items])
    
        onSelectCheckedItems(items.filter(item => item.checked === true));
    }

    const toggleCheckbox = (index: number) => {
        const newItems = [...renderItems];
        newItems[index].checked = !newItems[index].checked;
        setRenderItems(newItems);
    }
    
    return (
        <>
        {title.length > 0 && <Text style={style.title}>{title}</Text>}
        {renderItems.map((l, i) => (
            <ListItem
              key={i}
              onPress={(e) => {
                  if (checkBoxes && !renderBasedOnCheckbox) toggleCheckbox(i)
                  else itemOnPress(l, i)
              }}
            >
                <Avatar rounded size="medium" source={{ uri: l.avatar_url }}/>
                <ListItem.Content>
                    <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                    <ListItem.Title>{`${l.name}`}</ListItem.Title>
                    {l.verified && l.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                    </View>
                    {l.subtitle && <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>}
                </ListItem.Content>
                {checkBoxes &&
                <ListItem.CheckBox 
                    checked={l.checked} 
                    checkedIcon={<Ionicons name="checkmark-circle" size={25} color="#734f96"/>} 
                    uncheckedIcon={<Ionicons name="checkmark-circle-outline" size={25} color="#734f96"/>}
                    onPress={() => {
                        if (!renderBasedOnCheckbox) toggleCheckbox(i)
                        else itemOnPress(l, i)
                    }}/>
                }
            </ListItem>
          ))}
        </>
    )
}

export default BaseList