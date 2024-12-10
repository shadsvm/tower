import { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'default' | 'outline'
  color?: string
}

export default function Button(props: ButtonProps)  {
  const styles = {
  'outline': `bg-transparent text-${props?.color || 'neutral-300'} border-${props?.color || 'neutral-300'} hover:bg-${props?.color || 'white'} hover:text-black transition`,
  'default': `bg-${props?.color || 'red-500'} text-black hover:bg-${props?.color || 'white'} transition`,
  'shared': ' p-3 px-6 rounded '
  }
  return <button {...{ className: styles['shared'] + styles[props?.variant || 'default']}} >{props.children}</button>
}
