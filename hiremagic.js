import React, { useEffect, useRef, useState, useMemo } from "react";
import "./AtsDashBoardHeader.css";
import WinspireHeader from "./WinspireHeader";
import { useSelector } from "react-redux";
import { useGetCustomerMenuItemQuery } from "../../Redux/API/atsSlice";
import { BASE_URL } from "../../Redux/API/apiSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import usePrivilege from "../Privileges/Privileges";
import SubHeaderHamburger from "../../Assests/Hamburger_Menu.svg";

const AtsDashBoardHeader = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuItemsReady, setMenuItemsReady] = useState(false);

  const isAuth = useSelector((state) => state.auth);
  const { data } = useGetCustomerMenuItemQuery({
    domain_name: isAuth?.user.domain_name,
  });

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const main_header = useMemo(() => {
    const items =
      data?.message?.find((section) => section.header_name === "menu_header")
        ?.items || [];
    if (items.length > 0 && !menuItemsReady) {
      setMenuItemsReady(true);
    }
    return items;
  }, [data]);

  const isJob = usePrivilege("Job");
  const isDept = usePrivilege("Department");
  const isInterview = usePrivilege("Interview");
  const isCandidate = usePrivilege("Candidate");

  const filteredMenuItems = useMemo(() => {
    const userId = isAuth?.user?.user_id;

    return main_header.filter((item) => {
      if (item.name_of_the_menu === "Dashboard") return true;
      if (item.name_of_the_menu === "Jobs") return isJob.includes(userId);
      if (item.name_of_the_menu === "Candidates") return isCandidate.includes(userId);
      if (item.name_of_the_menu === "Departments") return isDept.includes(userId);
      if (item.name_of_the_menu === "Interviews") return isInterview.includes(userId);
      return true;
    });
  }, [main_header, isJob, isCandidate, isDept, isInterview]);

  useEffect(() => {
    if (!menuItemsReady || !filteredMenuItems.length) return;

    const type = params.get("type")?.toLowerCase();

    const typeToMenuMap = {
      home: "Dashboard",
      job_openings: "Jobs",
      createjob: "Jobs",
      candidates: "Candidates",
      createcandidates: "Candidates",
      interviews: "Interviews",
      createinterviews: "Interviews",
      departments: "Departments",
    };

    const targetMenuName = typeToMenuMap[type];
    if (targetMenuName) {
      const matchedIndex = filteredMenuItems.findIndex(
        (item) =>
          item.name_of_the_menu.toLowerCase() === targetMenuName.toLowerCase()
      );
      if (matchedIndex !== -1) {
        setActiveIndex(matchedIndex);
      }
    }
  }, [params, filteredMenuItems, menuItemsReady]);

  const toggleMenuPopup = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleIconClick = (index, isFilter) => {
    setActiveIndex(index);
    if (!isFilter) {
      navigate(`${filteredMenuItems[index]?.route_name}`);
      setShowDropdown(false);
    }
  };

  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <WinspireHeader />
      <div className="atsdashboardheader-wrapper">
        <div className="atsdashboardheader-container">
          <div className="atsdashboardheader-icon-menu">
            {/* Hamburger Icon */}
            <div
              className={`atsdashboardheader-icon-wrapper ${
                showDropdown ? "active" : ""
              }`}
            >
              <button
                ref={hamburgerRef}
                className={`atsdashboardheader-icon-button ats-header-menudropdown ${
                  showDropdown ? "active" : ""
                }`}
                onClick={toggleMenuPopup}
                aria-label="Menu"
              >
                <img
                  src={SubHeaderHamburger}
                  alt="hamburger"
                  className="atsdashboardheader-menu-icon"
                />
              </button>
              <span className="atsdashboardheader-tooltip">Menu</span>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div ref={dropdownRef} className="ast-header-dropdown-popup">
                {filteredMenuItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`ast-header-dropdown-item ${
                      activeIndex === i ? "active" : ""
                    }`}
                    onClick={() => handleIconClick(i, false)}
                  >
                    <img
                      src={`${BASE_URL}${item.icon}`}
                      alt="icon"
                      className="ast-header-menu-icon"
                    />
                    <span>{item.name_of_the_menu}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Main Header Icons */}
            {filteredMenuItems.map((item, index) => (
              <div
                key={item.id}
                className={`atsdashboardheader-icon-wrapper ${
                  activeIndex === index ? "active" : ""
                }`}
              >
                <button
                  className={`atsdashboardheader-icon-button ${
                    activeIndex === index ? "active" : ""
                  }`}
                  aria-label={item.name_of_the_menu}
                  onClick={() => handleIconClick(index, false)}
                >
                  <img
                    src={`${BASE_URL}${item.icon}`}
                    alt={item.name_of_the_menu}
                    className="atsdashboardheader-menu-icon"
                  />
                  <span className="menu-label">{item.name_of_the_menu}</span>
                </button>
                <span className="atsdashboardheader-tooltip">
                  {item.name_of_the_menu}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsDashBoardHeader;