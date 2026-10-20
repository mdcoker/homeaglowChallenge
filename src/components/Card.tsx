import { View, type ViewProps } from 'react-native';

type CardProps = ViewProps & {
  /** `outlined` is the bordered white card; `filled` is the grey info panel. */
  variant?: 'outlined' | 'filled';
};

export const Card = ({ variant = 'outlined', className = '', ...props }: CardProps) => (
  <View
    className={`overflow-hidden rounded-12px ${
      variant === 'outlined' ? 'border-thin border-border-primary' : 'bg-fill-secondary'
    } ${className}`}
    {...props}
  />
);

export const CardDivider = () => <View className="h-[1px] bg-border-primary" />;
