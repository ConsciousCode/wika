Wika (standardized WikiText) parser.

## How it works
Wika uses a special parsing style which combines an arbitrary number of totally different parsers, picking up any text that isn't parsed as plaintext. There are two basic types:
* Prefix parser (checked at the beginning of a line)
* Inplace parser (checks within text)

Prefix parsers are first-come, first serve using a match() method.

Inplace parsers implement a next() method which returns the index of the next item they can parse. Whichever index is closest to the current position is the parser that will be used.

Both parser types must implement parse() which returns non-null.

Parsers are preferably not stateful and instead use WikaParser's data member.
