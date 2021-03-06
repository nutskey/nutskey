import $ from 'cafy';
import * as ms from 'ms';
import define from '../../define';
import { ApiError } from '../../error';
import { Pages, DriveFiles } from '../../../../models';
import { ID } from '../../../../misc/cafy-id';

export const meta = {
	desc: {
		'ja-JP': '指定したページの情報を更新します。',
	},

	tags: ['pages'],

	requireCredential: true,

	kind: 'write:pages',

	limit: {
		duration: ms('1hour'),
		max: 300
	},

	params: {
		pageId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '対象のページのID',
				'en-US': 'Target page ID.'
			}
		},

		title: {
			validator: $.str,
		},

		name: {
			validator: $.optional.str,
		},

		summary: {
			validator: $.optional.nullable.str,
		},

		content: {
			validator: $.arr($.obj())
		},

		variables: {
			validator: $.arr($.obj())
		},

		eyeCatchingImageId: {
			validator: $.optional.nullable.type(ID),
		},

		font: {
			validator: $.optional.str.or(['serif', 'sans-serif']),
		},

		alignCenter: {
			validator: $.optional.bool,
		},
	},

	errors: {
		noSuchPage: {
			message: 'No such page.',
			code: 'NO_SUCH_PAGE',
			id: '21149b9e-3616-4778-9592-c4ce89f5a864'
		},

		accessDenied: {
			message: 'Access denied.',
			code: 'ACCESS_DENIED',
			id: '3c15cd52-3b4b-4274-967d-6456fc4f792b'
		},

		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: 'cfc23c7c-3887-490e-af30-0ed576703c82'
		},
	}
};

export default define(meta, async (ps, user) => {
	const page = await Pages.findOne(ps.pageId);
	if (page == null) {
		throw new ApiError(meta.errors.noSuchPage);
	}
	if (page.userId !== user.id) {
		throw new ApiError(meta.errors.accessDenied);
	}

	let eyeCatchingImage = null;
	if (ps.eyeCatchingImageId != null) {
		eyeCatchingImage = await DriveFiles.findOne({
			id: ps.eyeCatchingImageId,
			userId: user.id
		});

		if (eyeCatchingImage == null) {
			throw new ApiError(meta.errors.noSuchFile);
		}
	}

	await Pages.update(page.id, {
		updatedAt: new Date(),
		title: ps.title,
		name: ps.name === undefined ? page.name : ps.name,
		summary: ps.name === undefined ? page.summary : ps.summary,
		content: ps.content,
		variables: ps.variables,
		alignCenter: ps.alignCenter === undefined ? page.alignCenter : ps.alignCenter,
		font: ps.font === undefined ? page.font : ps.font,
		eyeCatchingImageId: ps.eyeCatchingImageId === null
			? null
			: ps.eyeCatchingImageId === undefined
				? page.eyeCatchingImageId
				: eyeCatchingImage!.id,
	});
});
