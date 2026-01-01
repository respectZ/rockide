package mcfunction

type INodeParamSpec interface {
	INode
	ParamSpec() (ParameterSpec, bool)
}
