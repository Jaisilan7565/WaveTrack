import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { SlUser } from "react-icons/sl";

const TopBar = ({ onToggleSidebar, pageTitle }) => {
  return (
    <div className="flex h-16 items-center justify-between p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <GiHamburgerMenu
          size={25}
          className="text-black cursor-pointer"
          onClick={onToggleSidebar}
        />
        <h1 className="text-black text-lg font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center">
        <IoSettingsOutline
          size={25}
          className="text-black m-2 cursor-pointer"
        />
        <IoNotificationsOutline
          size={25}
          className="text-black m-2 cursor-pointer"
        />
        <SlUser size={22} className="text-black ml-2 mr-4 cursor-pointer" />
      </div>
    </div>
  );
};

export default TopBar;
