#include "interpolation.hpp"

glm::vec3
interpolation::evalLERP(glm::vec3 const& p0, glm::vec3 const& p1, float const x)
{
	// Linear interpolation: (1-x)*p0 + x*p1
	return (1.0f - x) * p0 + x * p1;
}

glm::vec3
interpolation::evalCatmullRom(glm::vec3 const& p0, glm::vec3 const& p1,
                              glm::vec3 const& p2, glm::vec3 const& p3,
                              float const t, float const x)
{
	//! \todo Implement this function
	// Catmull-Rom with tension 't' using the basis provided:
	// q(x) = [1 x x^2 x^3] * B * [p0 p1 p2 p3]
	// where B rows are:
	// [0, 1, 0, 0]
	// [-t, 0, t, 0]
	// [2t, t-3, 3-2t, -t]
	// [-t, 2-t, t-2, t]

	float x2 = x * x;
	float x3 = x2 * x;

	float c0 = (-t) * x + (2.0f * t) * x2 + (-t) * x3; // = -t*x + 2t*x^2 - t*x^3
	float c1 = 1.0f + (t - 3.0f) * x2 + (2.0f - t) * x3; // = 1 + (t-3)x^2 + (2-t)x^3
	float c2 = t * x + (3.0f - 2.0f * t) * x2 + (t - 2.0f) * x3; // = t*x + (3-2t)x^2 + (t-2)x^3
	float c3 = (-t) * x2 + t * x3; // = -t*x^2 + t*x^3

	return c0 * p0 + c1 * p1 + c2 * p2 + c3 * p3;
}
