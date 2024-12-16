import {
	ClientSideRowModelModule,
	ModuleRegistry,
	NumberFilterModule,
	TextFilterModule,
	ValidationModule,
	colorSchemeDarkBlue,
	colorSchemeLightWarm,
	themeQuartz,
	themeAlpine,
} from "ag-grid-community";
import { Theme, useTheme } from "./theme-context";

ModuleRegistry.registerModules([
	TextFilterModule,
	NumberFilterModule,
	ClientSideRowModelModule,

	ValidationModule /* Development Only */,
]);

export const getTheme = (theme: Theme) => {
	return theme === "dark"
		? themeAlpine.withParams({
				rowBorder: { style: "solid", width: 1, color: "#404854" },
				columnBorder: { style: "solid", width: 1, color: "#404854" },
		  })
		: themeAlpine.withParams({
				rowBorder: { style: "solid", width: 1, color: "#404854" },
				columnBorder: { style: "solid", width: 1, color: "#404854" },
		  });
	// return theme === "dark"
	// 	? themeAlpine.withPart(colorSchemeDarkBlue)
	// 	: themeAlpine.withPart(colorSchemeLightWarm);
};

// export const gridTheme = themeQuartz
// 	.withParams(
// 		{
// 			backgroundColor: "#FFE8E0",
// 			foregroundColor: "#361008CC",
// 			browserColorScheme: "light",
// 		},
// 		"light"
// 	)
// 	.withParams(
// 		{
// 			backgroundColor: "#201008",
// 			foregroundColor: "#FFFFFFCC",
// 			// backgroundColor: "--background",
// 			// foregroundColor: "--foreground",
// 			browserColorScheme: "dark",
// 		},
// 		"dark"
// 	);
