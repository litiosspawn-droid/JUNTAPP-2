import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/client'
import { doc, getDoc } from 'firebase/firestore'

/**
 * GET /api/user/[uid]/role
 * Obtiene el rol de un usuario desde Firestore
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params
    
    if (!uid) {
      return NextResponse.json({ error: 'UID requerido' }, { status: 400 })
    }

    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        role: 'user' 
      }, { status: 404 })
    }

    const userData = userDoc.data()
    
    return NextResponse.json({
      uid,
      role: userData.role || 'user',
      banned: userData.banned || false,
      emailVerified: userData.emailVerified || false,
    })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json(
      { error: 'Error al obtener el rol del usuario' },
      { status: 500 }
    )
  }
}
