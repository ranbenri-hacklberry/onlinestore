import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface AppIconProps extends LucideProps {
    name: string;
}

const AppIcon: React.FC<AppIconProps> = ({ name, ...props }) => {
    const IconComponent = (LucideIcons as any)[name];

    if (!IconComponent) {
        return <LucideIcons.HelpCircle {...props} />;
    }

    return <IconComponent {...props} />;
};

export default AppIcon;