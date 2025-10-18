export default function VideoPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-custom py-20">
      <h1 className="text-h1 mb-4">Video Detail</h1>
      <p className="text-muted-foreground">Video ID: {params.id}</p>
      <p className="text-muted-foreground">Coming soon - Full video detail page</p>
    </div>
  )
}
