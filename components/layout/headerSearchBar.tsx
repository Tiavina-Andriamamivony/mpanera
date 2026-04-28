import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Search } from "lucide-react"

export const HeaderSearchBar = () => {
  return (
    <InputGroup className="w-fit">
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Rechercher un prestataire..." />
    </InputGroup>
  )
}
