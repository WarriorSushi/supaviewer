import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    // Search creators by name or email
    let creatorsQuery = supabase
      .from('creators')
      .select('id, name, slug, email, avatar_url')
      .order('name')
      .limit(10)

    if (query) {
      creatorsQuery = creatorsQuery.or(
        `name.ilike.%${query}%,email.ilike.%${query}%`
      )
    }

    const { data: creators, error } = await creatorsQuery

    if (error) {
      console.error('Error searching creators:', error)
      return NextResponse.json(
        { error: 'Failed to search creators' },
        { status: 500 }
      )
    }

    return NextResponse.json({ creators: creators || [] })
  } catch (error: any) {
    console.error('Error in creators search API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
