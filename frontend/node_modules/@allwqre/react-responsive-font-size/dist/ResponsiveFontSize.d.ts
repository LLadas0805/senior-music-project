import { CSSProperties, ReactNode, FC } from "react";
import { OptionsObject } from "./useResponsiveFontSize";
interface UseResponsiveFontSizeProps {
    children: ReactNode;
    ratio: number;
    className?: string;
    style?: CSSProperties;
    optionsObject?: OptionsObject;
}
declare const ResponsiveFontSize: FC<UseResponsiveFontSizeProps>;
export default ResponsiveFontSize;
