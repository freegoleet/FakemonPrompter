//typescript FakemonPrompter / svg.d.ts

declare module "*.svg" {
    import * as React from "react";
    const content: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
    export default content;
}

 declare module "*.svg?react" {
   import * as React from "react";
   const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
   export default ReactComponent;
 }