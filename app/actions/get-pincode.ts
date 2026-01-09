'use server'

interface PincodeResponse {
  Message: string
  Status: string
  PostOffice: Array<{
    Name: string
    Description: null
    BranchType: string
    DeliveryStatus: string
    Circle: string
    District: string
    Division: string
    Region: string
    Block: string
    State: string
    Country: string
    Pincode: string
  }>
}

export async function getPincodeDetails(pincode: string) {
  if (!pincode || pincode.length !== 6) {
    return { success: false, error: 'Invalid pincode length' }
  }

  try {
    console.log(`[PincodeAction] Fetching details for: ${pincode}`)
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    
    if (!res.ok) {
        console.error('[PincodeAction] API gave error status:', res.status)
        throw new Error('Failed to fetch pincode details')
    }

    const data: PincodeResponse[] = await res.json()
    console.log('[PincodeAction] API Response:', JSON.stringify(data[0]?.Status))
    
    if (data && data[0] && data[0].Status === 'Success') {
        const details = data[0].PostOffice[0]
        console.log('[PincodeAction] Found details:', details.District, details.State)
        return {
            success: true,
            city: details.District,
            state: details.State,
            country: details.Country
        }
    } else {
        console.warn('[PincodeAction] Pincode not found or API error')
        return { success: false, error: 'Pincode not found' }
    }

  } catch (error) {
    console.error('Error fetching pincode:', error)
    return { success: false, error: 'Failed to lookup pincode' }
  }
}
