import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Proxy: Request received')
    
    const body = await request.json()
    console.log('Proxy: Body parsed:', body)
    
    const action = body.action || request.nextUrl.searchParams.get('action')
    console.log('Proxy: Action:', action)
    
    if (!action) {
      console.log('Proxy: No action specified')
      return NextResponse.json({ error: 'No action specified' }, { status: 400 })
    }

         const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbwPFB-WBPEMUSN8gbZnFJ-l4BFDc9w8eBddeCf5fZCjoU1FNXHuRcw5shuDu_V328Ew/exec'
    console.log('Proxy: Calling Google Script:', `${googleScriptUrl}?action=${action}`)
    
    const response = await fetch(`${googleScriptUrl}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Proxy: Google Script response status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Proxy: Google Script data received:', data)
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
