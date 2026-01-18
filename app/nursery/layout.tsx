import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'שפת המדבר | משתלה',
    description: 'משתלה ועגלת קפה בלב גיתית. מגוון ענק של צמחים, עצי פרי, נוי ותבלינים. בואו לקפה מול הנוף או הזמינו אונליין.',
    openGraph: {
        title: 'שפת המדבר 🌵 משתלה פורחת',
        description: 'הזמינו צמחים מיוחדים לבית ולגינה, או בואו להתאהב בטבע עם קפה טוב ביד.',
        images: ['/og-image.png'],
        locale: 'he_IL',
        type: 'website',
        siteName: 'שפת המדבר',
    },
    // Custom icons for this route
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/apple-icon.png',
    }
};

export default function NurseryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
