package mcfunction

import (
	"github.com/rockide/language-server/internal/mcfunction/lexer"
)

// TODO: Create a parent for this INodeArgPair.
// It's just a INodeArg with PairsSpec method, but having a separate interface.

// TODO: Create interface INodeSpec, with ParamSpec method. This creates another layer of abstraction for INodeArg and INodeArgPair.

type PairKind uint8

const (
	PairKindUnknown PairKind = iota
	PairKindKey
	PairKindEqual
	PairKindValue
)

type INodeArgPair interface {
	INodeArg
	PairSpec() (*ParameterSpec, bool)
}

type NodeArgPair struct {
	*NodeArg
	spec *ParameterSpec
}

func (n *NodeArgPair) addChild(child INode) {
	child.setParent(n)
	child.setIndex(len(n.children))
	n.children = append(n.children, child)
}

func (n *NodeArgPair) setParent(parent INode) {
	n.parent = parent
}

func (n *NodeArgPair) setIndex(index int) {
	n.index = index
}

func (n *NodeArgPair) PairSpec() (*ParameterSpec, bool) {
	return n.spec, n.spec != nil
}

type INodeArgPairChild interface {
	INodeArgPair
	PairKind() PairKind
	PairSpec() (*ParameterSpec, bool)
}

type NodeArgPairChild struct {
	*NodeArg
	pairKind PairKind
}

func (n *NodeArgPairChild) addChild(child INode) {
	child.setParent(n)
	child.setIndex(len(n.children))
	n.children = append(n.children, child)
}

func (n *NodeArgPairChild) setParent(parent INode) {
	n.parent = parent
}

func (n *NodeArgPairChild) setIndex(index int) {
	n.index = index
}

func (n *NodeArgPairChild) PairKind() PairKind {
	return n.pairKind
}

func (n *NodeArgPairChild) PairSpec() (*ParameterSpec, bool) {
	if p, ok := n.parent.(*NodeArgPair); ok {
		return p.PairSpec()
	}
	return nil, false
}

func createPairs(input []rune, token lexer.Token, spec *MapSpec) []INodeArgPair {
	value := []rune(token.Text(input))
	startOffset := token.Start + 1
	value = value[1 : len(value)-1]
	lex := lexer.New(value)
	keyTokens := []lexer.Token{}
	var assignToken lexer.Token
	valueTokens := []lexer.Token{}
	createPair := func() INodeArgPair {
		start := assignToken.Start + startOffset
		end := assignToken.End + startOffset
		tKey, kOk := mergeTokens(keyTokens...)
		if kOk {
			start = tKey.Start + startOffset
			if assignToken.Kind == lexer.TokenUnknown {
				end = tKey.End + startOffset
			}
		}
		tValue, vOk := mergeTokens(valueTokens...)
		if vOk {
			end = tValue.End + startOffset
		}
		node := &NodeArgPair{
			NodeArg: &NodeArg{
				Node: &Node{
					kind:  NodeKindCommandArg,
					start: start,
					end:   end,
				},
				paramKind: ParameterKindMapPair,
			},
		}
		if kOk {
			key := &NodeArgPairChild{
				NodeArg: &NodeArg{
					Node: &Node{
						kind:  NodeKindCommandArg,
						start: tKey.Start + startOffset,
						end:   tKey.End + startOffset,
					},
					paramKind: ParameterKindMapPair,
				},
				pairKind: PairKindKey,
			}
			node.addChild(key)
			keyValue := key.Text(input)
			if spec != nil {
				if s, ok := spec.GetSpec(keyValue); ok {
					node.spec = s
				}
			}
		}
		if assignToken.Kind != lexer.TokenUnknown {
			node.addChild(&NodeArgPairChild{
				NodeArg: &NodeArg{
					Node: &Node{
						kind:  NodeKindCommandArg,
						start: assignToken.Start + startOffset,
						end:   assignToken.End + startOffset,
					},
					paramKind: ParameterKindMapPair,
				},
				pairKind: PairKindEqual,
			})
		}
		if vOk {
			node.addChild(&NodeArgPairChild{
				NodeArg: &NodeArg{
					Node: &Node{
						kind:  NodeKindCommandArg,
						start: tValue.Start + startOffset,
						end:   tValue.End + startOffset,
					},
					paramKind: ParameterKindMapPair,
				},
				pairKind: PairKindValue,
			})
		}
		keyTokens = []lexer.Token{}
		valueTokens = []lexer.Token{}
		assignToken = lexer.Token{}
		return node
	}
	pairs := []INodeArgPair{}
	state := 0
	for t := range lex.Next() {
		if t.Kind == lexer.TokenComment || t.Kind == lexer.TokenWhitespace {
			continue
		}
		switch state {
		case 0:
			switch t.Kind {
			case lexer.TokenEquals:
				assignToken = t
				state = 1
			case lexer.TokenComma:
				continue
			default:
				keyTokens = append(keyTokens, t)
			}
		case 1:
			switch t.Kind {
			case lexer.TokenComma:
				state = 0
				pairs = append(pairs, createPair())
			case lexer.TokenMap:
				// TODO: nested map
			case lexer.TokenJSON:
				// TODO: nested json (not really json)
			default:
				valueTokens = append(valueTokens, t)
			}
		}
	}
	if assignToken.Kind != lexer.TokenUnknown || len(keyTokens) > 0 {
		pairs = append(pairs, createPair())
	}
	return pairs
}

func mergeTokens(tokens ...lexer.Token) (lexer.Token, bool) {
	if len(tokens) == 0 {
		return lexer.Token{}, false
	}
	start := tokens[0].Start
	end := tokens[0].End
	for i := 1; i < len(tokens); i++ {
		if tokens[i].Start < start {
			start = tokens[i].Start
		}
		if tokens[i].End > end {
			end = tokens[i].End
		}
	}
	return lexer.Token{
		Kind:  lexer.TokenString,
		Start: start,
		End:   end,
	}, true
}
