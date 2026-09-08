import { Page, Intro } from '@/components/SiteParts'
import FanUpload from '@/components/FanUpload'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
import { pageMetadata } from '@/lib/public/seo.mjs'
import './upload.css'
export const metadata={...pageMetadata({title:'Share your show photos & videos',description:'Send your photos and videos from an Echo Play Live show directly to the band.',path:'/upload'}),robots:{index:false,follow:false}}
export default async function UploadPage({searchParams}) {
  const query=await searchParams
  const bands=publicBandPresentation.filter(b=>!b.hidden).map(({slug,name})=>({slug,name}))
  const initialBand=bands.some(b=>b.slug===query.band)?query.band:''
  return <Page><Intro eyebrow="From your side of the stage" title="Got a good shot?"><p>We’d love to see it. Choose the show and send your photos or videos straight to the band.</p></Intro><div className="shell fan-upload-shell"><FanUpload bands={bands} initialBand={initialBand}/></div></Page>
}
