import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface MenuState {
    menuOpened: boolean;
    menuDashboardSidebar: boolean;
}

const initialState: MenuState = {
    menuOpened: false,
    menuDashboardSidebar: false,
};

export const MenuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {
        openMenu: (state) => {
            state.menuOpened = true;
        },
        closeMenu: (state) => {
            state.menuOpened = false;
        },
        toggleSidebar: (state) => {
            state.menuDashboardSidebar = !state.menuDashboardSidebar;
        },
    },
});

export const { openMenu, closeMenu, toggleSidebar } = MenuSlice.actions;

export const selectMenu = (state: RootState) => state.menu.menuOpened;
export const selectMenuSidebarDashboard = (state: RootState) => state.menu.menuDashboardSidebar;

export default MenuSlice.reducer;
