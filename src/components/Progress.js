import React from "react";

export default ( props ) => {
	const { classType, message, onclick } = props;
	return ( 
		<div className = "menu" >
			<p> { message } </p>
		</div> 
	);
}
