export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ auth?: string }>;
}) {
    const { auth } = await searchParams;
    const source = auth === 'login' ? '/index.html?auth=login' : '/index.html';
    return <iframe className="exact-page" src={source} title="Jaba9 betting platform" />;
}
