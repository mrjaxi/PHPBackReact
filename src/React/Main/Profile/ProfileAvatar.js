import {Avatar} from "antd";
import {UserOutlined} from "@ant-design/icons";
import React from "react";

const ProfileAvatar = ({size, image}) => {
   return (
       <Avatar size={size} style={{backgroundColor: '#AAB2BD'}}
               src={image && global.layout !== 'guest'
                   ? <img src={image}/>
                   : <UserOutlined/>
               }/>
   )
};

export default ProfileAvatar;