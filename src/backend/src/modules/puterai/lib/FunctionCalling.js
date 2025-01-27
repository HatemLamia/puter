module.exports = class FunctionCalling {
    /**
     * Normalizes the 'tools' object in-place.
     * 
     * This function will accept an array of tools provided by the
     * user, and produce a normalized object that can then be
     * converted to the apprpriate representation for another
     * service.
     * 
     * We will accept conventions from either service that a user
     * might expect to work, prioritizing the OpenAI convention
     * when conflicting conventions are present.
     * 
     * @param {*} tools 
     */
    static normalize_tools_object (tools) {
        for ( let i=0 ; i < tools.length ; i++ ) {
            const tool = tools[i];
            let normalized_tool = {};

            const normalize_function = fn => {
                const normal_fn = {};
                const parameters =
                    fn.parameters ||
                    fn.input_schema;
                
                normal_fn.parameters = parameters ?? {
                    type: 'object',
                };

                if ( fn.name ) {
                    normal_fn.name = fn.name;
                }

                if ( fn.description ) {
                    normal_fn.description = fn.description;
                }

                return normal_fn;
            }

            if ( tool.input_schema ) {
                normalized_tool = {
                    type: 'function',
                    function: normalize_function(tool),
                };
            } else if ( tool.type === 'function' ) {
                normalized_tool = {
                    type: 'function',
                    function: normalize_function(tool.function),
                }
            } else {
                normalized_tool = {
                    type: 'function',
                    function: normalize_function(tool),
                };
            }

            tools[i] = normalized_tool;
        }
        return tools;
    }

    /**
     * This function will convert a normalized tools object to the
     * format expected by OpenAI.
     * 
     * @param {*} tools 
     * @returns 
     */
    static make_openai_tools (tools) {
        return tools;
    }

    /**
     * This function will convert a normalized tools object to the
     * format expected by Claude.
     * 
     * @param {*} tools 
     * @returns 
     */
    static make_claude_tools (tools) {
        if ( ! tools ) return undefined;
        return tools.map(tool => {
            const { name, description, parameters } = tool.function;
            return {
                name,
                description,
                input_schema: parameters,
            };
        });
    }
}
