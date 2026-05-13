import { Link } from 'react-router-dom'

import { useAuthSession } from '../../auth/useAuthSession'
import { CreateCommunityForm } from '../components/CreateCommunityForm'
import { useCommunitiesQuery } from '../hooks'

export function CommunitiesIndexPage() {
  const { accessToken } = useAuthSession()
  const communitiesQuery = useCommunitiesQuery()

  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">Community index</span>
        <h1 className="section-title">Find the right space</h1>
        <p className="section-copy">
          Browse active communities, discover their focus, and move directly into the
          discussions that matter.
        </p>
      </section>

      <section className="panel">
        <h2 className="section-title">Available communities</h2>
        <div className="stack-md top-offset-sm">
          {communitiesQuery.isLoading ? <p className="section-copy">Loading communities…</p> : null}
          {communitiesQuery.data?.map((community) => (
            <Link className="community-card" key={community.id} to={`/communities/${community.slug}`}>
              <div>
                <div className="card-row">
                  <h3 className="card-title">{community.name}</h3>
                  <span className="inline-note">{community.visibility}</span>
                </div>
                <p className="section-copy">{community.description}</p>
              </div>
              <span className="text-link">View community</span>
            </Link>
          ))}
          {communitiesQuery.data?.length === 0 ? (
            <p className="section-copy">No communities yet. Start the first one below.</p>
          ) : null}
        </div>
      </section>

      <CreateCommunityForm accessToken={accessToken} />
    </>
  )
}
