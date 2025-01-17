import {
  Sandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { amethyst } from "@codesandbox/sandpack-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function SandPack({ files, loading }: any) {
  const [isCodeEditorEnable, setIsCodeEditorEnable] = useState(false);

  return (
    <div className="">
      <div className="  bg-black/90 w-full ">
        <div className="inline-flex  bg-black/90 p-1 pl-3">
          <button
            onClick={() => setIsCodeEditorEnable(true)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium transition-colors rounded-md",
              isCodeEditorEnable === true
                ? "bg-[#0EA5E9] text-white"
                : "text-white/70 hover:text-white"
            )}
          >
            Code
          </button>

          <button
            onClick={() => setIsCodeEditorEnable(false)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium transition-colors rounded-md",
              isCodeEditorEnable === false
                ? "bg-[#0EA5E9] text-white"
                : "text-white/70 hover:text-white"
            )}
          >
            Preview
          </button>
        </div>
      </div>
      {loading ? (
        <div className=" flex-col h-screen flex items-center justify-center">
          <Loader2 size={50} className=" animate-spin" />
          <span>Generating...</span>
        </div>
      ) : (
        <SandpackProvider
          className=" !h-screen"
          template="react"
          theme={amethyst}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            recompileMode: "immediate",
          }}
          customSetup={{
            dependencies: { "lucide-react": "latest", "shadcn-ui": "latest" },
          }}
          files={files}
        >
          <SandpackLayout className=" !h-screen">
            {isCodeEditorEnable && (
              <SandpackCodeEditor
                showRunButton
                showTabs
                className=" !h-[85%]"
                showLineNumbers={false}
                showInlineErrors
                wrapContent
                closableTabs
              />
            )}
            {!isCodeEditorEnable && (
              <SandpackPreview showNavigator className=" !h-[85%]" />
            )}
          </SandpackLayout>
        </SandpackProvider>
      )}
    </div>
  );
}
