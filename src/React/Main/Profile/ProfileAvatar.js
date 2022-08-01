import {Avatar, Image, Spin} from "antd";
import {LoadingOutlined, UserOutlined} from "@ant-design/icons";
import React from "react";

const ProfileAvatar = ({size, image}) => {
   return (
       <Avatar size={size} style={{minWidth: 48, minHeight: 48,backgroundColor: '#AAB2BD'}}
               src={image && global.layout !== 'guest'
                   ? <Image placeholder={
                       <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                           <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                       </div>
                   } preview={false} style={{ height: `${size}px`}} src={image}/>
                   : <UserOutlined/>
               }/>
   )
};

export default ProfileAvatar;