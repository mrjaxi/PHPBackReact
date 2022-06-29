import React from "react";
import {Image, Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";

const CustomImage = (firstFile, fileIfNotFirst) => {
    return (
        <Image
            width={260}
            height={260}
            style={{ borderRadius: 200, objectFit: 'cover',}}
            src={firstFile ? firstFile : fileIfNotFirst}
            placeholder={
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                </div>
            }
        />
    )
};

export default CustomImage;