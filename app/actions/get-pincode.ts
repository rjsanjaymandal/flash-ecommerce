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
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    
    if (!res.ok) {
        throw new Error('Failed to fetch pincode details')
    }

    const data: PincodeResponse[] = await res.json()
    
    if (data && data[0] && data[0].Status === 'Success') {
        const details = data[0].PostOffice[0]
        return {
            success: true,
            city: details.District,
            state: details.State,
            country: details.Country
        }
    } else {
        return { success: false, error: 'Pincode not found' }
    }

  } catch (error) {
    console.error('Error fetching pincode:', error)
    return { success: false, error: 'Failed to lookup pincode' }
  }
}
