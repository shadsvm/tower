import { ComponentProps, useEffect, useState } from "react";

export default function Alert({
  text,
  ...rest
}: { text: string } & ComponentProps<"div">) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 3000);
  }, [text]);

  if (active)
    return (
      <div
        role="alert"
        className={
          "absolute bottom-0 inset-x-0 flex justify-center items-center border-gray-100 bg-white  p-4 dark:border-neutral-800 dark:bg-neutral-900"
        }
        {...rest}
      >
        {text}
      </div>
    );
}
