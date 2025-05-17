import React from "react";
import styled from "styled-components";

export default function Loading({ text = "", fullScreen = true }) {
	if (fullScreen) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
				<StyledWrapper>
					<div className="loading">
						<svg width="64px" height="48px">
							<polyline
								points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
								id="back"
							/>
							<polyline
								points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
								id="front"
							/>
						</svg>
					</div>
				</StyledWrapper>
				<div className="text-xl text-gray-700">{text}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-8">
			<StyledWrapper>
				<div className="loading">
					<svg width="64px" height="48px">
						<polyline
							points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
							id="back"
						/>
						<polyline
							points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
							id="front"
						/>
					</svg>
				</div>
			</StyledWrapper>
			<div className="text-lg text-gray-700">{text}</div>
		</div>
	);
}


const StyledWrapper = styled.div`
	.loading svg polyline {
		fill: none;
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.loading svg polyline#back {
		fill: none;
		// stroke: #ff4d5033;
	}

	.loading svg polyline#front {
		fill: none;
		stroke: rgb(34 197 94);
		stroke-dasharray: 48, 144;
		stroke-dashoffset: 192;
		animation: dash_682 1.4s linear infinite;
	}

	@keyframes dash_682 {
		72.5% {
			opacity: 0;
		}

		to {
			stroke-dashoffset: 0;
		}
	}
`;
