package mcfunction

type INodeParamSpec interface {
	ParamSpec() (ParameterSpec, bool)
}
