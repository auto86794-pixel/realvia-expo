import { Redirect } from 'expo-router'

// A régi, második hirdetésfeladó helyett mindig az egységes oldal nyílik meg.
export default function CreateRedirect() {
  return <Redirect href="/upload" />
}
