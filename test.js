import axios from 'axios'

const smsService = {
    name: '5sim',
    apiKey: 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Njc5NTY5MTIsImlhdCI6MTczNjQyMDkxMiwicmF5IjoiZDI1NWEwMmRhMDZkZjdmNzgwYTQ5NGY2ZGViMTA3MTgiLCJzdWIiOjIzMjE2NjF9.dPoU9P81iU5Jab6rO_TyaOja-2XcrjLDDJqmZvX3pS5Nzj9U8hE0VaJprw1h_brc3JRDIRtNAX-Be3o4EJ5KA_xwa1BU5EoIQB3w8YKqfXE4mhvVBxLpnSNizAlni_gVwbiXcHzcfJC6O87597xHS-UddVT9bEv-wwhQMKVBw8IR0zksj32DPsjms9Q1RwTqgSgp5wGvXuEHqE_f3sbz_9E8jUekDK-4W9am8E1Qe-VKvDOtKONIg6XVr6OCyVgOSaBQVaUpPEe0HcIUXyRyrmcWADDjcu38m9BXCw2x1BQtpwNA0ArvtbifcEuHjXCpNPu5oBl5nwWb8oBxOtzvSA',
    country: 'india',
    maxPrice: 21
}

let headers = {
    Authorization: `Bearer ${smsService.apiKey}`,
    Accept: 'application/json',
  };

async function getNumber() {
try {
    const response = await axios.get(
    `https://5sim.biz/v1/user/buy/activation/${smsService.country}/any/google?maxPrice=${smsService.maxPrice}`,
    { headers: headers }
    );
    console.log(response)
    console.log(response.data)
    const { id, phone, operator } = response.data;

    return { id, number: phone, operator };
} catch (error) {
    throw error;
}
}

console.log(await getNumber())
